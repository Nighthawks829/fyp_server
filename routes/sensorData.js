const express = require("express");
const router = express.Router();

const {
  getAllSensorData,
  getSensorData,
  addSensorData,
} = require("../controllers/sensorData");

router.route("/").get(getAllSensorData).post(addSensorData);
router.route("/:id").get(getSensorData);

module.exports = router;
