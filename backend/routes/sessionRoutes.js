const express = require("express");
const router = express.Router();
const {
  createEntry,
  processExit,
  getSessions,
} = require("../controllers/sessionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/entry", createEntry);
router.post("/exit", processExit);
router.get("/", getSessions);

module.exports = router;
