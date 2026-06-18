const supabase = require("../config/supabase");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const { parking_location_id } = req.query;

    if (!parking_location_id) {
      return errorResponse(res, "Parking location ID is required", 400);
    }

    // 1. Slot Statistics
    const { data: slots, error: slotsError } = await supabase
      .from("parking_slots")
      .select("status")
      .eq("parking_location_id", parking_location_id);

    if (slotsError) throw slotsError;

    const totalCapacity = slots.length;
    const occupiedSlots = slots.filter((s) => s.status === "OCCUPIED").length;
    const availableSlots = slots.filter((s) => s.status === "AVAILABLE").length;
    const occupancyPercentage = totalCapacity
      ? ((occupiedSlots / totalCapacity) * 100).toFixed(2)
      : 0;

    // 2. Active Sessions (Vehicles Currently Inside)
    const { count: activeVehicles, error: activeError } = await supabase
      .from("parking_sessions")
      .select("id", { count: "exact" })
      .eq("parking_location_id", parking_location_id)
      .eq("status", "ACTIVE");

    if (activeError) throw activeError;

    // 3. Revenue calculations (Today, This Week, This Month)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const { data: completedSessions, error: revenueError } = await supabase
      .from("parking_sessions")
      .select("exit_time, total_amount")
      .eq("parking_location_id", parking_location_id)
      .eq("status", "COMPLETED")
      .gte("exit_time", firstDayOfMonth.toISOString()); // only fetch this month's data

    if (revenueError) throw revenueError;

    let revenueToday = 0;
    let revenueThisWeek = 0;
    let revenueThisMonth = 0;

    completedSessions.forEach((session) => {
      const amount = Number(session.total_amount) || 0;
      const exitDate = new Date(session.exit_time);

      revenueThisMonth += amount;

      if (exitDate >= firstDayOfWeek) {
        revenueThisWeek += amount;
      }

      if (exitDate >= today) {
        revenueToday += amount;
      }
    });

    successResponse(
      res,
      {
        totalCapacity,
        occupiedSlots,
        availableSlots,
        occupancyPercentage: Number(occupancyPercentage),
        vehiclesCurrentlyInside: activeVehicles,
        revenueToday,
        revenueThisWeek,
        revenueThisMonth,
      },
      "Dashboard summary fetched successfully",
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
};
