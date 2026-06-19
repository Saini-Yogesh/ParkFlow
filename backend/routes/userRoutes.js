const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  updateUserStatus,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router
  .route("/")
  .post(authorize("SUPER_ADMIN", "PARKING_ADMIN"), createUser)
  .get(authorize("SUPER_ADMIN", "PARKING_ADMIN"), getUsers);

router
  .route("/:id/status")
  .put(authorize("SUPER_ADMIN", "PARKING_ADMIN"), updateUserStatus);

router
  .route("/:id")
  .patch(authorize("SUPER_ADMIN", "PARKING_ADMIN"), updateUser)
  .delete(authorize("SUPER_ADMIN", "PARKING_ADMIN"), deleteUser);

module.exports = router;
