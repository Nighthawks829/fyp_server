// Import required modules
const express = require("express");
const router = express.Router();

// Import notification controller functions
const {
  getAllNotifications,
  getNotification,
  addNotification,
  updateNotification,
  deleteNotification,
} = require("../controllers/notification");

// Import user authentication middleware
const authenticateUser = require("../middleware/authenticationUser");

/**
 * Base route: '/api/notifications'
 * 
 * GET / - Retrieve all notifications for authenticated user
 * POST / - Create a new notification entry
 */
router
  .route("/")
  .get(authenticateUser, getAllNotifications)
  .post(authenticateUser, addNotification);

/**
 * ID parameter routes: '/api/notifications/:id'
 * 
 * GET /:id - Get specific notification details
 * PATCH /:id - Update existing notification content
 * DELETE /:id - Remove notification from system
 */
router
  .route("/:id")
  .get(authenticateUser, getNotification)
  .patch(authenticateUser, updateNotification)
  .delete(authenticateUser, deleteNotification);

module.exports = router;
