const express = require("express");
const router = express.Router();

const {
  getAllSensorData,
  getSensorData,
  addSensorData,
  getLatestSensorData
} = require("../controllers/sensorData");

router.route("/").get(getAllSensorData).post(addSensorData);
router.route("/:id").get(getSensorData);
router.route("/latest/:id").get(getLatestSensorData);

module.exports = router;
