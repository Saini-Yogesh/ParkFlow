const express = require("express");
const router = express.Router();
const {
  getVehicleTypes,
  getRevenueTrend,
  getPeakHours,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/vehicle-types", getVehicleTypes);
router.get("/revenue", getRevenueTrend);
router.get("/peak-hours", getPeakHours);

module.exports = router;
