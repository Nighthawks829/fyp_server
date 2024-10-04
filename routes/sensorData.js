const express = require("express");
const router = express.Router();

const {
  getAllSensorData,
  getSensorData,
  // addSensorData,
  getLatestSensorData
} = require("../controllers/sensorData");

const authenticateUser = require("../middleware/authenticationUser");

router
  .route("/")
  .get(authenticateUser, getAllSensorData)
  // .post(authenticateUser, addSensorData);
router.route("/:id").get(authenticateUser, getSensorData);
router.route("/latest/:id").get(authenticateUser, getLatestSensorData);

module.exports = router;
