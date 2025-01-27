// Import required modules
const express = require("express");
const router = express.Router();

// Import controller functions for sensor data operations
const {
  getAllSensorData,
  getSensorData,
  getLatestSensorData,
  addSensorData
} = require("../controllers/sensorData");

// Import user authentication middleware
const authenticateUser = require("../middleware/authenticationUser");

/**
 * Base route: '/api/sensor-data'
 * 
 * GET / - Retrieve all sensor data entries (User authentication required)
 * POST / - Store new sensor data measurement (Public access)
 */
router
router
  .route("/")
  .get(authenticateUser, getAllSensorData)
  .post(addSensorData);

/**
* ID parameter route: '/api/sensor-data/:id'
* 
* GET /:id - Get specific sensor data entry by ID (User authentication required)
*/
router.route("/:id").get(authenticateUser, getSensorData);

/**
 * Specialized route: '/api/sensor-data/latest/:id'
 * 
 * GET /latest/:id - Get most recent measurement for specific sensor 
 * (User authentication required)
 */
router.route("/latest/:id").get(authenticateUser, getLatestSensorData);

module.exports = router;
