const supabase = require("../config/supabase");
const { hashPassword } = require("../utils/password");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");

// @desc    Create a new user (Parking Admin or Worker)
// @route   POST /api/users
// @access  Private (SUPER_ADMIN or PARKING_ADMIN)
const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, parking_location_id } =
      req.body;

    // Validate role permissions
    if (req.user.role === "WORKER") {
      return errorResponse(res, "Not authorized to create users", 403);
    }

    if (req.user.role === "PARKING_ADMIN" && role !== "WORKER") {
      return errorResponse(res, "Parking Admin can only create workers", 403);
    }

    if (!name || !email || !password || !role) {
      return errorResponse(
        res,
        "Please provide name, email, password and role",
        400,
      );
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return errorResponse(res, "User already exists", 400);
    }

    const hashed_password = await hashPassword(password);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          phone,
          password_hash: hashed_password,
          role,
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    // If role is WORKER, link to parking_location_id
    if (role === "WORKER" && parking_location_id) {
      const { error: workerError } = await supabase
        .from("parking_workers")
        .insert([
          {
            user_id: newUser.id,
            parking_location_id,
          },
        ]);

      if (workerError) throw workerError;
    }

    successResponse(
      res,
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      "User created successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (filtered by role)
// @route   GET /api/users
// @access  Private (SUPER_ADMIN or PARKING_ADMIN)
const getUsers = async (req, res, next) => {
  try {
    if (req.user.role === "WORKER") {
      return errorResponse(res, "Not authorized", 403);
    }

    const { role } = req.query;
    let query = supabase.from("users").select(`
      id, name, email, phone, role, status, created_at,
      parking_workers (
        parking_locations (
          name
        )
      )
    `);

    if (role) {
      query = query.eq("role", role);
    }

    // If PARKING_ADMIN, only fetch workers assigned to their locations
    if (req.user.role === "PARKING_ADMIN") {
      // First get locations managed by this admin
      const { data: locations } = await supabase
        .from("parking_locations")
        .select("id")
        .eq("admin_id", req.user.id);

      const locationIds = locations.map((l) => l.id);

      // Then get workers for these locations
      const { data: workers } = await supabase
        .from("parking_workers")
        .select("user_id")
        .in("parking_location_id", locationIds);

      const workerIds = workers.map((w) => w.user_id);

      query = query.in("id", workerIds);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    successResponse(res, users, "Users fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (suspend/activate)
// @route   PUT /api/users/:id/status
// @access  Private (SUPER_ADMIN)
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (req.user.role !== "SUPER_ADMIN") {
      return errorResponse(res, "Only Super Admin can suspend accounts", 403);
    }

    if (!["ACTIVE", "SUSPENDED"].includes(status)) {
      return errorResponse(res, "Invalid status", 400);
    }

    const { data: user, error } = await supabase
      .from("users")
      .update({ status })
      .eq("id", req.params.id)
      .select("id, status")
      .single();

    if (error) throw error;

    successResponse(res, user, `User status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUserStatus,
};
