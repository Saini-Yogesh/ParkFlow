const express = require("express");
const router = express.Router();
const {
  createPricing,
  getPricing,
} = require("../controllers/pricingController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").post(createPricing).get(getPricing);

module.exports = router;
