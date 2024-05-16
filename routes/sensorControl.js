const express = require("express");
const router = express.Router();

const {
  getAllSensorControls,
  getSensorControl,
  addSensorControl,
} = require("../controllers/sensorControl");

const authenticateAdmin = require("../middleware/authenticationAdmin");

router
  .route("/")
  .get(getAllSensorControls)
  .post(authenticateAdmin, addSensorControl);
router.route("/:id").get(getSensorControl);

module.exports = router;
