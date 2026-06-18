const express = require("express");
const router = express.Router();
const {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
} = require("../controllers/locationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").post(createLocation).get(getLocations);

router
  .route("/:id")
  .get(getLocationById)
  .put(updateLocation)
  .delete(deleteLocation);

module.exports = router;
