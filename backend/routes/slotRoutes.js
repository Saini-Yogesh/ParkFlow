const express = require("express");
const router = express.Router();
const {
  createSlot,
  getSlots,
  getAvailableSlots,
  updateSlotStatus,
  updateSlot,
  deleteSlot,
} = require("../controllers/slotController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/available", getAvailableSlots);

router.route("/").post(createSlot).get(getSlots);

router.route("/:id").put(updateSlotStatus).patch(updateSlot).delete(deleteSlot);

module.exports = router;
