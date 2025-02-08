// Import required modules
const express = require("express");
const router = express.Router();

// Import dashboard controller functions
const {
  getAllDashboard,
  getDashboard,
  addDashboard,
  updateDashboard,
  deleteDashboard
} = require("../controllers/dashboard");

// Import user authentication middleware
const authenticateUser = require("../middleware/authenticationUser");

/**
 * Base route: '/api/dashboards'
 * 
 * GET / - Retrieve all dashboards for authenticated user
 * POST / - Create a new dashboard for authenticated user
 */
router
  .route("/")
  .get(authenticateUser, getAllDashboard)
  .post(authenticateUser, addDashboard);

/**
* ID parameter routes: '/api/dashboards/:id'
* 
* GET /:id - Get specific dashboard details
* PATCH /:id - Update existing dashboard configuration
* DELETE /:id - Remove dashboard from system
*/
router
  .route("/:id")
  .get(authenticateUser, getDashboard)
  .patch(authenticateUser, updateDashboard)
  .delete(authenticateUser, deleteDashboard);

module.exports = router;
