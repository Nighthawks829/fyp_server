const express = require("express");
const router = express.Router();

const {
  getAllSensors,
  getSensor,
  addSensor,
  updateSensor,
  deleteSensor,
} = require("../controllers/sensor");

const authenticateUser = require("../middleware/authenticationUser");
const authenticateAdmin = require("../middleware/authenticationAdmin");

router
  .route("/")
  .get(authenticateUser, getAllSensors)
  .post(authenticateAdmin, addSensor);
router
  .route("/:id")
  .get(authenticateUser, getSensor)
  .patch(authenticateAdmin, updateSensor)
  .delete(authenticateAdmin, deleteSensor);

module.exports = router;
