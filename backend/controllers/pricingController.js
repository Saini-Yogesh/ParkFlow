const supabase = require("../config/supabase");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");

// @desc    Create/Update pricing rules
// @route   POST /api/pricing
// @access  Private (PARKING_ADMIN)
const createPricing = async (req, res, next) => {
  try {
    const {
      parking_location_id,
      vehicle_category,
      base_price,
      hourly_price,
      daily_price,
    } = req.body;

    // Get the category ID based on the string sent from frontend (e.g., 'CAR')
    const { data: cat } = await supabase
      .from("vehicle_categories")
      .select("id")
      .ilike("name", `%${vehicle_category}%`)
      .limit(1)
      .single();
    if (!cat) return errorResponse(res, "Invalid vehicle category", 400);

    // Upsert pricing rule
    const { data: pricing, error } = await supabase
      .from("pricing_rules")
      .upsert(
        [
          {
            parking_location_id,
            vehicle_category_id: cat.id,
            base_price,
            hourly_price,
            daily_price,
          },
        ],
        { onConflict: "parking_location_id, vehicle_category_id" },
      )
      .select()
      .single();

    if (error) throw error;

    successResponse(res, pricing, "Pricing configured successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get pricing rules
// @route   GET /api/pricing
// @access  Private
const getPricing = async (req, res, next) => {
  try {
    const { parking_location_id } = req.query;

    let query = supabase.from("pricing_rules").select(`
      *,
      vehicle_categories (name, code),
      parking_locations (name)
    `);

    if (parking_location_id) {
      query = query.eq("parking_location_id", parking_location_id);
    }

    const { data: pricing, error } = await query;

    if (error) throw error;

    successResponse(res, pricing, "Pricing fetched successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPricing,
  getPricing,
};
