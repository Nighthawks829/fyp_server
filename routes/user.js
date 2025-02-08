const express = require("express");
const router = express.Router();
const rateLimiter = require("express-rate-limit");
const {
  addUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/user");

const authenticateUser = require("../middleware/authenticationUser");
const authenticateAdmin = require("../middleware/authenticationAdmin");

require("dotenv").config();

/**
 * Rate Limiter Configuration
 * 
 * Production: 100 requests/15 minutes
 * Development: 1000 requests/15 minutes
 * Protects against enumeration attacks and abuse
 */
const apiLimiter = rateLimiter({
  windowMs: process.env.RATE_WINDOWMS,
  max: process.env.RATE_MAX,
  message: {
    msg: "Too many request from this IP. Please try again after 15 minutes",
  },
});


// User Management Endpoints

/**
 * Base Route: /users
 * 
 * GET - List all users (Admin only)
 * POST - Create new user (Admin only)
 */
router
  .route("/")
  .get(authenticateAdmin, getAllUsers)
  .post(authenticateAdmin, addUser);

/**
 * Individual User Route: /users/:id
 * 
 * GET - Get user profile (Owner or Admin)
 * PATCH - Update user (Owner or Admin)
 * DELETE - Delete user (Admin only)
 */
router
  .route("/:id")
  .get(authenticateUser, getUser)
  .patch(authenticateUser, updateUser)
  .delete(authenticateAdmin, deleteUser);

module.exports = router;
