// Handle async errors in Express routes
require("express-async-errors");

// Security and middleware packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

// Database and IoT connections
const sequelize = require("../db/connect");   // Sequelize ORM instance
const mqtt = require("../mqtt/connect");      // MQTT broker connection

// Custom middleware
const authenticateUser = require("../middleware/authenticationUser");
const authenticateAdmin = require("../middleware/authenticationAdmin");
const notFoundMiddleware = require("../middleware/not-found");
const errorHandlerMiddleware = require("../middleware/error-handler");

// API route modules
const authRouter = require("../routes/auth");
const userRouter = require("../routes/user");
const boardRouter = require("../routes/board");
const sensorRouter = require("../routes/sensor");
const notificationRouter = require("../routes/notification");
const dashboardRouter = require("../routes/dashboard");
const sensorDataRouter = require("../routes/sensorData");
const sensorControlRouter = require("../routes/sensorControl");

const express = require("express");

/**
 * Creates and configures an Express server instance
 * @returns {Express} Configured Express application instance
 */

function createServer() {
  const app = express();

  // =====================
  // Essential Middleware
  // =====================
  app.use(express.json());    // Parse JSON request bodies
  app.use(express.urlencoded({ extended: true }));     // Parse URL-encoded data
  app.use(cookieParser());    // Parse cookies
  app.use(fileUpload());      // Handle file uploads


  // =====================
  // Security Middleware
  // =====================
  app.use(helmet());    // Set security headers
  app.use(xss());       // Prevent XSS attacks

  // Rate limiting for API endpoints
  app.use(
    rateLimiter({
      WindowMs: 15 * 60 * 1000, // 15 minute window
      max: 100000 // Max requests per IP per window
    })
  );

  // CORS configuration for cross-origin requests
  app.use(
    cors({
      origin: "http://192.168.0.110:3000",    // Allowed frontend origin
      credentials: true   // Allow credentials/cookies
    })
  );

  // =====================
  // API Route Mounting
  // =====================
  // Version 1 API endpoints  
  app.use("/api/v1/auth", authRouter);                    // Authentication routes
  app.use("/api/v1/user", userRouter);                    // User management
  app.use("/api/v1/board", boardRouter);                  // Device board management
  app.use("/api/v1/sensor", sensorRouter);                // Sensor management
  app.use("/api/v1/notification", notificationRouter);    // Notifications system
  app.use("/api/v1/dashboard", dashboardRouter);          // User dashboards
  app.use("/api/v1/sensorData", sensorDataRouter);        // Sensor telemetry data
  app.use("/api/v1/sensorControl", sensorControlRouter);  // Sensor control systems

  // =====================
  // Error Handling
  // =====================
  app.use(notFoundMiddleware);        // 404 handler for undefined routes
  app.use(errorHandlerMiddleware);    // Custom error handler

  return app;
}

module.exports = createServer;
