const supabase = require("../config/supabase");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");

// @desc    Create a new parking location
// @route   POST /api/locations
// @access  Private (PARKING_ADMIN)
const createLocation = async (req, res, next) => {
  try {
    const { name, code, address, city, state, country, latitude, longitude } =
      req.body;

    if (req.user.role !== "PARKING_ADMIN") {
      return errorResponse(res, "Only Parking Admin can create locations", 403);
    }

    if (!name || !code || !address || !city || !country) {
      return errorResponse(
        res,
        "Please provide name, code, address, city, and country",
        400,
      );
    }

    const { data: location, error } = await supabase
      .from("parking_locations")
      .insert([
        {
          admin_id: req.user.id,
          name,
          code,
          address,
          city,
          state,
          country,
          latitude,
          longitude,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return errorResponse(res, "Location code already exists", 400);
      }
      throw error;
    }

    successResponse(res, location, "Location created successfully", 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all locations
// @route   GET /api/locations
// @access  Private
const getLocations = async (req, res, next) => {
  try {
    let query = supabase.from("parking_locations").select("*");

    if (req.user.role === "PARKING_ADMIN") {
      query = query.eq("admin_id", req.user.id);
    } else if (req.user.role === "WORKER") {
      // Get worker's assigned location
      const { data: workerAssignments } = await supabase
        .from("parking_workers")
        .select("parking_location_id")
        .eq("user_id", req.user.id);

      const locationIds = workerAssignments.map((w) => w.parking_location_id);
      query = query.in("id", locationIds);
    }

    const { data: locations, error } = await query;

    if (error) throw error;

    successResponse(res, locations, "Locations fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get single location
// @route   GET /api/locations/:id
// @access  Private
const getLocationById = async (req, res, next) => {
  try {
    const { data: location, error } = await supabase
      .from("parking_locations")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !location) {
      return errorResponse(res, "Location not found", 404);
    }

    successResponse(res, location, "Location fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private (PARKING_ADMIN)
const updateLocation = async (req, res, next) => {
  try {
    if (req.user.role !== "PARKING_ADMIN" && req.user.role !== "SUPER_ADMIN") {
      return errorResponse(res, "Not authorized", 403);
    }

    const {
      name,
      code,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      status,
    } = req.body;

    const { data: location, error } = await supabase
      .from("parking_locations")
      .update({
        name,
        code,
        address,
        city,
        state,
        country,
        latitude,
        longitude,
        status,
      })
      .eq("id", req.params.id)
      // If Parking Admin, ensure they own it
      .match(req.user.role === "PARKING_ADMIN" ? { admin_id: req.user.id } : {})
      .select()
      .single();

    if (error || !location) {
      return errorResponse(res, "Location not found or unauthorized", 404);
    }

    successResponse(res, location, "Location updated successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private (SUPER_ADMIN or PARKING_ADMIN)
const deleteLocation = async (req, res, next) => {
  try {
    if (req.user.role !== "PARKING_ADMIN" && req.user.role !== "SUPER_ADMIN") {
      return errorResponse(res, "Not authorized", 403);
    }

    const { data: location, error } = await supabase
      .from("parking_locations")
      .delete()
      .eq("id", req.params.id)
      .match(req.user.role === "PARKING_ADMIN" ? { admin_id: req.user.id } : {})
      .select()
      .single();

    if (error || !location) {
      return errorResponse(res, "Location not found or unauthorized", 404);
    }

    successResponse(res, null, "Location deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};
