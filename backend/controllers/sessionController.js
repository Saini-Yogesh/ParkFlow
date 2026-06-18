const supabase = require("../config/supabase");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");
const { v4: uuidv4 } = require("uuid");

// Helper to calculate price
const calculateAmount = (entryTime, exitTime, pricingRule) => {
  const durationMs = new Date(exitTime) - new Date(entryTime);
  const durationMinutes = Math.ceil(durationMs / (1000 * 60));
  const durationHours = Math.ceil(durationMinutes / 60);
  const durationDays = Math.ceil(durationHours / 24);

  let totalAmount = Number(pricingRule.base_price);

  if (durationDays > 1 && pricingRule.daily_price > 0) {
    totalAmount += durationDays * Number(pricingRule.daily_price);
  } else if (durationHours > 0) {
    totalAmount += durationHours * Number(pricingRule.hourly_price);
  }

  return { durationMinutes, totalAmount };
};

// @desc    Create new parking session (Entry)
// @route   POST /api/sessions/entry
// @access  Private (WORKER)
const createEntry = async (req, res, next) => {
  try {
    const { parking_location_id, vehicle_number, vehicle_category_id } =
      req.body;

    if (!parking_location_id || !vehicle_number || !vehicle_category_id) {
      return errorResponse(
        res,
        "Please provide location, vehicle number and category",
        400,
      );
    }

    // Verify worker assignment
    if (req.user.role === "WORKER") {
      const { data: worker } = await supabase
        .from("parking_workers")
        .select("id")
        .eq("user_id", req.user.id)
        .eq("parking_location_id", parking_location_id)
        .single();

      if (!worker) {
        return errorResponse(res, "Not authorized for this location", 403);
      }
    }

    // Check if vehicle already has an active session globally or just this location
    const { data: activeSession } = await supabase
      .from("parking_sessions")
      .select("id")
      .eq("vehicle_number", vehicle_number)
      .eq("status", "ACTIVE")
      .single();

    if (activeSession) {
      return errorResponse(
        res,
        "Vehicle already has an active parking session",
        400,
      );
    }

    // Find available slot
    const { data: slot, error: slotError } = await supabase
      .from("parking_slots")
      .select("id, slot_number")
      .eq("parking_location_id", parking_location_id)
      .eq("vehicle_category_id", vehicle_category_id)
      .eq("status", "AVAILABLE")
      .order("slot_number")
      .limit(1)
      .single();

    if (slotError || !slot) {
      return errorResponse(
        res,
        "No available slots for this vehicle category",
        400,
      );
    }

    const ticket_number = `TKT-${uuidv4().split("-")[0].toUpperCase()}`;

    // Transaction-like approach using RPC or separate queries
    // 1. Mark slot occupied
    await supabase
      .from("parking_slots")
      .update({ status: "OCCUPIED" })
      .eq("id", slot.id);

    // 2. Create session
    const { data: session, error: sessionError } = await supabase
      .from("parking_sessions")
      .insert([
        {
          ticket_number,
          parking_location_id,
          slot_id: slot.id,
          vehicle_number,
          vehicle_category_id,
          created_by: req.user.id,
          status: "ACTIVE",
        },
      ])
      .select(
        `
        *,
        parking_slots(slot_number),
        parking_locations(name),
        vehicle_categories(name)
      `,
      )
      .single();

    if (sessionError) throw sessionError;

    // Emit events
    req.app
      .get("io")
      .to(`location_${parking_location_id}`)
      .emit("vehicle-entered", session);
    req.app
      .get("io")
      .to(`location_${parking_location_id}`)
      .emit("slot-updated", { id: slot.id, status: "OCCUPIED" });

    successResponse(res, session, "Entry processed successfully", 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Process vehicle exit
// @route   POST /api/sessions/exit
// @access  Private (WORKER)
const processExit = async (req, res, next) => {
  try {
    const { identifier, payment_method } = req.body; // identifier can be ticket_number or vehicle_number

    if (!identifier || !payment_method) {
      return errorResponse(
        res,
        "Please provide ticket/vehicle number and payment method",
        400,
      );
    }

    // Find active session
    const { data: session, error: sessionError } = await supabase
      .from("parking_sessions")
      .select("*")
      .eq("status", "ACTIVE")
      .or(`ticket_number.eq.${identifier},vehicle_number.eq.${identifier}`)
      .single();

    if (sessionError || !session) {
      return errorResponse(res, "Active parking session not found", 404);
    }

    // Fetch pricing rules for this location and category
    const { data: pricingRule } = await supabase
      .from("pricing_rules")
      .select("*")
      .eq("parking_location_id", session.parking_location_id)
      .eq("vehicle_category_id", session.vehicle_category_id)
      .single();

    if (!pricingRule) {
      return errorResponse(
        res,
        "Pricing rules not configured for this vehicle type",
        400,
      );
    }

    const exitTime = new Date();
    const { durationMinutes, totalAmount } = calculateAmount(
      session.entry_time,
      exitTime,
      pricingRule,
    );

    // Update Session
    const { data: updatedSession, error: updateError } = await supabase
      .from("parking_sessions")
      .update({
        exit_time: exitTime,
        duration_minutes: durationMinutes,
        total_amount: totalAmount,
        payment_method,
        payment_status: "PAID",
        closed_by: req.user.id,
        status: "COMPLETED",
      })
      .eq("id", session.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Add Payment Record
    await supabase.from("payments").insert([
      {
        session_id: session.id,
        amount: totalAmount,
        payment_method,
        reference_number: `PAY-${uuidv4().split("-")[0].toUpperCase()}`,
      },
    ]);

    // Free up the slot
    await supabase
      .from("parking_slots")
      .update({ status: "AVAILABLE" })
      .eq("id", session.slot_id);

    // Emit Events
    req.app
      .get("io")
      .to(`location_${session.parking_location_id}`)
      .emit("vehicle-exited", updatedSession);
    req.app
      .get("io")
      .to(`location_${session.parking_location_id}`)
      .emit("slot-updated", { id: session.slot_id, status: "AVAILABLE" });

    successResponse(res, updatedSession, "Exit processed successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get parking sessions
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const { parking_location_id, status } = req.query;

    if (!parking_location_id) {
      return errorResponse(res, "Parking location ID is required", 400);
    }

    let query = supabase
      .from("parking_sessions")
      .select(
        `
        *,
        parking_slots(slot_number),
        vehicle_categories(name)
      `,
      )
      .eq("parking_location_id", parking_location_id)
      .order("entry_time", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: sessions, error } = await query;

    if (error) throw error;

    successResponse(res, sessions, "Sessions fetched successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEntry,
  processExit,
  getSessions,
};
