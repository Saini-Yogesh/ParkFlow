const supabase = require("../config/supabase");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");

// @desc    Get vehicle type distribution
// @route   GET /api/analytics/vehicle-types
// @access  Private
const getVehicleTypes = async (req, res, next) => {
  try {
    const { parking_location_id } = req.query;

    if (!parking_location_id) {
      return errorResponse(res, "Parking location ID is required", 400);
    }

    const { data: sessions, error } = await supabase
      .from("parking_sessions")
      .select(
        `
        vehicle_categories(name)
      `,
      )
      .eq("parking_location_id", parking_location_id);

    if (error) throw error;

    const distribution = {};
    sessions.forEach((s) => {
      const name = s.vehicle_categories.name;
      distribution[name] = (distribution[name] || 0) + 1;
    });

    const result = Object.keys(distribution).map((key) => ({
      name: key,
      value: distribution[key],
    }));

    successResponse(res, result, "Vehicle types fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue trend
// @route   GET /api/analytics/revenue
// @access  Private
const getRevenueTrend = async (req, res, next) => {
  try {
    const { parking_location_id, days = 30 } = req.query;

    if (!parking_location_id)
      return errorResponse(res, "Parking location ID is required", 400);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - parseInt(days));

    const { data: sessions, error } = await supabase
      .from("parking_sessions")
      .select("exit_time, total_amount")
      .eq("parking_location_id", parking_location_id)
      .eq("status", "COMPLETED")
      .gte("exit_time", pastDate.toISOString());

    if (error) throw error;

    const dailyRevenue = {};
    sessions.forEach((s) => {
      const date = new Date(s.exit_time).toISOString().split("T")[0];
      dailyRevenue[date] =
        (dailyRevenue[date] || 0) + Number(s.total_amount || 0);
    });

    const result = Object.keys(dailyRevenue)
      .sort()
      .map((date) => ({
        date,
        revenue: dailyRevenue[date],
      }));

    successResponse(res, result, "Revenue trend fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get peak hours for a specific location
// @route   GET /api/analytics/peak-hours
// @access  Private
const getPeakHours = async (req, res, next) => {
  try {
    const { parking_location_id } = req.query;

    if (!parking_location_id)
      return errorResponse(res, "Parking location ID is required", 400);

    const { data: sessions, error } = await supabase
      .from("parking_sessions")
      .select("entry_time")
      .eq("parking_location_id", parking_location_id)
      .not("entry_time", "is", null);

    if (error) throw error;

    const hourlyActivity = Array(24).fill(0);
    sessions.forEach((s) => {
      const hour = new Date(s.entry_time).getHours();
      hourlyActivity[hour]++;
    });

    const result = hourlyActivity.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      activity: count,
    }));

    successResponse(res, result, "Peak hours fetched successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicleTypes,
  getRevenueTrend,
  getPeakHours,
};
