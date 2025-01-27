const express = require("express");
const router = express.Router();
const rateLimiter = require("express-rate-limit");
const { login, logout } = require("../controllers/auth");

require("dotenv").config();


/**
 * Rate Limiter Configuration
 * 
 * Production: 100 requests/15 minutes
 * Development: 1000 requests/15 minutes
 * Protects against credential stuffing and brute force attacks
 */
const apiLimiter = rateLimiter({
  windowMs: process.env.RATE_WINDOWMS,
  max: process.env.RATE_MAX,
  message: {
    msg: "Too many request from this IP. Please try again after 15 minutes",
  },
});

// Authentication Endpoints

/**
 * POST /login
 * 
 * User authentication endpoint:
 * - Validates credentials
 * - Issues session tokens
 * - Rate limited for security
 */
router.post("/login", apiLimiter, login);

/**
 * POST /logout
 * 
 * Session termination endpoint:
 * - Destroys session tokens
 * - Clears authentication cookies
 * - Rate limited to prevent abuse
 */
router.post("/logout", apiLimiter, logout);

module.exports = router;
