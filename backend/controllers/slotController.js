const supabase = require("../config/supabase");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");

// @desc    Create a new slot
// @route   POST /api/slots
// @access  Private (PARKING_ADMIN)
const createSlot = async (req, res, next) => {
  try {
    const { parking_location_id, slot_number, vehicle_category } = req.body;

    if (req.user.role !== "PARKING_ADMIN") {
      return errorResponse(res, "Only Parking Admin can create slots", 403);
    }

    // Verify location belongs to admin
    const { data: location } = await supabase
      .from("parking_locations")
      .select("id")
      .eq("id", parking_location_id)
      .eq("admin_id", req.user.id)
      .single();

    if (!location) {
      return errorResponse(
        res,
        "Parking location not found or unauthorized",
        404,
      );
    }

    const frontendToDbCode = {
      CAR: "MEDIUM",
      BIKE: "LIGHT",
      TRUCK: "HEAVY"
    };

    // Look up category ID
    const dbCode = frontendToDbCode[vehicle_category] || "MEDIUM";
    const { data: catData } = await supabase
      .from("vehicle_categories")
      .select("id")
      .eq("code", dbCode)
      .single();

    const { data: slot, error } = await supabase
      .from("parking_slots")
      .insert([
        {
          parking_location_id,
          slot_number,
          vehicle_category_id: catData?.id,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return errorResponse(
          res,
          "Slot number already exists in this location",
          400,
        );
      }
      throw error;
    }

    // Emit event (Disabled for Vercel Serverless polling)
    // req.app.get("io").to(`location_${parking_location_id}`).emit("slot-updated", slot);

    successResponse(res, slot, "Slot created successfully", 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get slots
// @route   GET /api/slots
// @access  Private
const getSlots = async (req, res, next) => {
  try {
    const { parking_location_id } = req.query;

    if (!parking_location_id) {
      return errorResponse(res, "Parking location ID is required", 400);
    }

    // For worker, verify assignment
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

    const { data: slots, error } = await supabase
      .from("parking_slots")
      .select(
        `
        *,
        vehicle_categories (name, code),
        parking_sessions (ticket_number, vehicle_number, status)
      `,
      )
      .eq("parking_location_id", parking_location_id)
      .order("slot_number");

    if (error) throw error;

    const dbToFrontendCode = {
      MEDIUM: "CAR",
      LIGHT: "BIKE",
      HEAVY: "TRUCK"
    };

    // Map relation back to flat string for the frontend
    const formattedSlots = slots.map((s) => {
      const activeSession = s.parking_sessions?.find(ps => ps.status === "ACTIVE");
      return {
        ...s,
        vehicle_category: s.vehicle_categories ? (dbToFrontendCode[s.vehicle_categories.code] || s.vehicle_categories.code) : "-",
        active_ticket: activeSession ? activeSession.ticket_number : null,
        active_plate: activeSession ? activeSession.vehicle_number : null,
        parking_sessions: undefined // clean up payload
      };
    });

    successResponse(res, formattedSlots, "Slots fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get available slots
// @route   GET /api/slots/available
// @access  Private
const getAvailableSlots = async (req, res, next) => {
  try {
    const { parking_location_id, vehicle_category_id } = req.query;

    if (!parking_location_id) {
      return errorResponse(res, "Parking location ID is required", 400);
    }

    let query = supabase
      .from("parking_slots")
      .select("*")
      .eq("parking_location_id", parking_location_id)
      .eq("status", "AVAILABLE");

    if (vehicle_category_id) {
      query = query.eq("vehicle_category_id", vehicle_category_id);
    }

    const { data: slots, error } = await query;

    if (error) throw error;

    successResponse(res, slots, "Available slots fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Update slot status
// @route   PUT /api/slots/:id
// @access  Private (PARKING_ADMIN)
const updateSlotStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (req.user.role !== "PARKING_ADMIN") {
      return errorResponse(res, "Only Parking Admin can modify slots", 403);
    }

    if (
      !["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"].includes(status)
    ) {
      return errorResponse(res, "Invalid status", 400);
    }

    const { data: slot, error } = await supabase
      .from("parking_slots")
      .update({ status })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Emit event (Disabled for Vercel Serverless polling)
    // req.app.get("io").to(`location_${slot.parking_location_id}`).emit("slot-updated", slot);

    successResponse(res, slot, "Slot updated successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Update slot details
// @route   PATCH /api/slots/:id
// @access  Private (PARKING_ADMIN)
const updateSlot = async (req, res, next) => {
  try {
    const { slot_number, vehicle_category } = req.body;

    if (req.user.role !== "PARKING_ADMIN") {
      return errorResponse(res, "Only Parking Admin can modify slots", 403);
    }

    let updates = {};
    if (slot_number) updates.slot_number = slot_number;

    if (vehicle_category) {
      const frontendToDbCode = { CAR: "MEDIUM", BIKE: "LIGHT", TRUCK: "HEAVY" };
      const dbCode = frontendToDbCode[vehicle_category] || "MEDIUM";
      const { data: catData } = await supabase
        .from("vehicle_categories")
        .select("id")
        .eq("code", dbCode)
        .single();
      
      if (catData?.id) updates.vehicle_category_id = catData.id;
    }

    const { data: slot, error } = await supabase
      .from("parking_slots")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return errorResponse(res, "Slot number already exists", 400);
      }
      throw error;
    }

    successResponse(res, slot, "Slot updated successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Delete slot
// @route   DELETE /api/slots/:id
// @access  Private (PARKING_ADMIN)
const deleteSlot = async (req, res, next) => {
  try {
    if (req.user.role !== "PARKING_ADMIN") {
      return errorResponse(res, "Only Parking Admin can delete slots", 403);
    }

    const { error } = await supabase
      .from("parking_slots")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    successResponse(res, null, "Slot deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSlot,
  getSlots,
  getAvailableSlots,
  updateSlotStatus,
  updateSlot,
  deleteSlot,
};
