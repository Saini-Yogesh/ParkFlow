const supabase = require("../config/supabase");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");

// @desc    Get executive summary
// @route   GET /api/enterprise/executive
// @access  Private (Admin)
const getExecutiveSummary = async (req, res, next) => {
  try {
    const { data, error } = await supabase.rpc("fn_get_executive_summary");
    if (error) throw error;
    successResponse(res, data, "Executive summary fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get peak heatmap
// @route   GET /api/enterprise/heatmap
// @access  Private (Admin)
const getPeakHeatmap = async (req, res, next) => {
  try {
    const { data, error } = await supabase.rpc("fn_get_peak_heatmap");
    if (error) throw error;
    successResponse(res, data, "Heatmap fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee performance
// @route   GET /api/enterprise/employees
// @access  Private (Admin)
const getEmployeePerformance = async (req, res, next) => {
  try {
    const { data, error } = await supabase.rpc("fn_get_employee_performance");
    if (error) throw error;
    successResponse(res, data, "Employee performance fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily revenue trend from MV
// @route   GET /api/enterprise/revenue-trend
// @access  Private (Admin)
const getRevenueTrend = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("mv_daily_revenue")
      .select("revenue_date, total_revenue")
      .order("revenue_date", { ascending: true })
      .limit(30);

    if (error && error.code === "42P01") {
      // Materialized view doesn't exist yet, return empty array gracefully
      return successResponse(res, [], "Materialized view pending creation");
    } else if (error) {
      throw error;
    }

    // Aggregate by date (combining locations/categories)
    const aggregated = {};
    data.forEach((row) => {
      aggregated[row.revenue_date] =
        (aggregated[row.revenue_date] || 0) + Number(row.total_revenue);
    });

    const result = Object.keys(aggregated).map((date) => ({
      date,
      revenue: aggregated[date],
    }));

    successResponse(res, result, "Revenue trend fetched successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExecutiveSummary,
  getPeakHeatmap,
  getEmployeePerformance,
  getRevenueTrend,
};
