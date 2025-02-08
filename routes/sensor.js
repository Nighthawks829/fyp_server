// Import required modules
const express = require("express");
const router = express.Router();

// Import controller functions for sensor operations
const {
  getAllSensors,
  getSensor,
  addSensor,
  updateSensor,
  deleteSensor,
} = require("../controllers/sensor");

// Import authentication middleware modules
const authenticateUser = require("../middleware/authenticationUser");
const authenticateAdmin = require("../middleware/authenticationAdmin");

/**
 * Base route: '/api/sensors'
 * 
 * GET / - Retrieve all sensor devices (User authentication required)
 * POST / - Create new sensor device (Admin authentication required)
 */
router
  .route("/")
  .get(authenticateUser, getAllSensors)
  .post(authenticateAdmin, addSensor);

/**
* ID parameter routes: '/api/sensors/:id'
* 
* GET /:id - Get detailed information about a specific sensor (User authentication required)
* PATCH /:id - Update sensor configuration/properties (Admin authentication required)
* DELETE /:id - Remove sensor from the system (Admin authentication required)
*/
router
  .route("/:id")
  .get(authenticateUser, getSensor)
  .patch(authenticateAdmin, updateSensor)
  .delete(authenticateAdmin, deleteSensor);

module.exports = router;
