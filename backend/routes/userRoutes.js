const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  updateUserStatus,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router
  .route("/")
  .post(authorize("SUPER_ADMIN", "PARKING_ADMIN"), createUser)
  .get(authorize("SUPER_ADMIN", "PARKING_ADMIN"), getUsers);

router.route("/:id/status").put(authorize("SUPER_ADMIN"), updateUserStatus);

module.exports = router;
