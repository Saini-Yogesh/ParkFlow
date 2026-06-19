const supabase = require("../config/supabase");
const {
  generateToken,
  generateRefreshToken,
} = require("../utils/generateToken");
const { matchPassword, hashPassword } = require("../utils/password");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");
const jwt = require("jsonwebtoken");

// @desc    Register a new PARKING_ADMIN (Public Signup)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, "Please provide name, email and password", 400);
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return errorResponse(res, "User already exists", 400);
    }

    const hashed_password = await hashPassword(password);

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          phone,
          password_hash: hashed_password,
          role: "PARKING_ADMIN",
          status: "ACTIVE",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const accessToken = generateToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    successResponse(
      res,
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        accessToken,
        refreshToken,
      },
      "Registration successful",
      201,
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Please provide email and password", 400);
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    if (user.status === "SUSPENDED") {
      return errorResponse(
        res,
        "Account suspended. Contact administrator.",
        403,
      );
    }

    const isMatch = await matchPassword(password, user.password_hash);

    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login: new Date() })
      .eq("id", user.id);

    // Fetch parking_location_id if worker
    let parking_location_id = null;
    if (user.role === "WORKER") {
      const { data: workerData } = await supabase
        .from("parking_workers")
        .select("parking_location_id")
        .eq("user_id", user.id)
        .single();
      if (workerData) {
        parking_location_id = workerData.parking_location_id;
      }
    }

    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    successResponse(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        parking_location_id,
        accessToken,
        refreshToken,
      },
      "Login successful",
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, "No refresh token provided", 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return errorResponse(res, "Invalid refresh token", 401);
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, status")
      .eq("id", decoded.id)
      .single();

    if (error || !user || user.status === "SUSPENDED") {
      return errorResponse(res, "User not found or suspended", 401);
    }

    const accessToken = generateToken(user.id);

    successResponse(res, { accessToken }, "Token refreshed");
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res, next) => {
  try {
    // Note: Since we are using stateless JWT, we just instruct the client to remove tokens
    successResponse(res, null, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return errorResponse(res, "Please provide old and new password", 400);
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return errorResponse(res, "User not found", 404);
    }

    const isMatch = await matchPassword(oldPassword, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, "Incorrect old password", 401);
    }

    const hashedNewPassword = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: hashedNewPassword })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    successResponse(res, null, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refresh,
  logoutUser,
  changePassword,
};
