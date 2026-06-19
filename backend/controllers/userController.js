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

    const { role, parking_location_id } = req.query;
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

    if (parking_location_id) {
      const { data: workersInLoc } = await supabase
        .from("parking_workers")
        .select("user_id")
        .eq("parking_location_id", parking_location_id);
      
      const ids = workersInLoc.map((w) => w.user_id);
      // If no workers in location, return empty early or force an impossible match
      if (ids.length === 0) {
        query = query.in("id", ["00000000-0000-0000-0000-000000000000"]);
      } else {
        query = query.in("id", ids);
      }
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
// @access  Private (SUPER_ADMIN or PARKING_ADMIN)
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "PARKING_ADMIN") {
      return errorResponse(res, "Only Admins can suspend accounts", 403);
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

// @desc    Update user details
// @route   PATCH /api/users/:id
// @access  Private (SUPER_ADMIN or PARKING_ADMIN)
const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, parking_location_id } = req.body;

    if (req.user.role === "WORKER") {
      return errorResponse(res, "Not authorized", 403);
    }

    let updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (password) {
      updates.password_hash = await hashPassword(password);
    }

    const { data: user, error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update worker location if provided
    if (parking_location_id) {
      // Check if location mapping exists
      const { data: existingLoc } = await supabase
        .from("parking_workers")
        .select("id")
        .eq("user_id", req.params.id)
        .single();

      if (existingLoc) {
        await supabase
          .from("parking_workers")
          .update({ parking_location_id })
          .eq("user_id", req.params.id);
      } else {
        await supabase
          .from("parking_workers")
          .insert([{ user_id: req.params.id, parking_location_id }]);
      }
    }

    successResponse(res, user, "User updated successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (SUPER_ADMIN or PARKING_ADMIN)
const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role === "WORKER") {
      return errorResponse(res, "Not authorized", 403);
    }

    // Delete associated worker mappings first (if FK doesn't cascade)
    await supabase.from("parking_workers").delete().eq("user_id", req.params.id);

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    successResponse(res, null, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUserStatus,
  updateUser,
  deleteUser,
};
