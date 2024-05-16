const express = require("express");
const router = express.Router();

const {
  getAllSensorControls,
  getSensorControl,
  addSensorControl,
} = require("../controllers/sensorControl");

router.route("/").get(getAllSensorControls).post(addSensorControl);
router.route("/:id").get(getSensorControl);

module.exports = router;
