const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/responseFormatter");
const supabase = require("../config/supabase");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return errorResponse(res, "Not authorized, no token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB using Supabase service role to ensure user still exists/is active
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role, status")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return errorResponse(res, "Not authorized, user not found", 401);
    }

    if (user.status === "SUSPENDED") {
      return errorResponse(
        res,
        "Account suspended. Contact administrator.",
        403,
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, "Not authorized, token failed", 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `User role ${req.user ? req.user.role : "Unknown"} is not authorized to access this route`,
        403,
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
