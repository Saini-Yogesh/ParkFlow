const express = require("express");
const router = express.Router();
const {
  createPricing,
  getPricing,
  updatePricing,
  deletePricing,
} = require("../controllers/pricingController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").post(createPricing).get(getPricing);

router.route("/:id").patch(updatePricing).delete(deletePricing);

module.exports = router;
