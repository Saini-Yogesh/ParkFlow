const express = require("express");
const router = express.Router();
const {
  getExecutiveSummary,
  getPeakHeatmap,
  getEmployeePerformance,
  getRevenueTrend,
} = require("../controllers/enterpriseController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("SUPER_ADMIN", "PARKING_ADMIN"));

router.get("/executive", getExecutiveSummary);
router.get("/heatmap", getPeakHeatmap);
router.get("/employees", getEmployeePerformance);
router.get("/revenue-trend", getRevenueTrend);

module.exports = router;
