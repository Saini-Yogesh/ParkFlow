const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorMiddleware");
const logger = require("./utils/logger");

// Initialize app
const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  }),
);

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Routes (to be implemented)
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const locationRoutes = require("./routes/locationRoutes");
const slotRoutes = require("./routes/slotRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const enterpriseRoutes = require("./routes/enterpriseRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/enterprise", enterpriseRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Resource not found" });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
// Trigger nodemon restart
