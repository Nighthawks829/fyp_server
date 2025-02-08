// Import required modules
const express = require("express");
const router = express.Router();

// Import controller functions for sensor control operations
const {
  getAllSensorControls,
  getSensorControl,
  addSensorControl,
} = require("../controllers/sensorControl");

// Import admin authentication middleware
const authenticateAdmin = require("../middleware/authenticationAdmin");

/**
 * Base route: '/api/sensor-controls'
 * 
 * GET / - Retrieve all sensor control configurations (Public access)
 * POST / - Create new sensor control configuration (Admin authentication required)
 */
router
  .route("/")
  .get(getAllSensorControls)
  .post(authenticateAdmin, addSensorControl);

/**
* ID parameter route: '/api/sensor-controls/:id'
* 
* GET /:id - Get specific sensor control details (Public access)
*/
router.route("/:id").get(getSensorControl);

module.exports = router;
