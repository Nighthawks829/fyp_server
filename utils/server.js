require("express-async-errors");
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

// Sequelize database
const sequelize = require("../db/connect");

// mqtt server
const mqtt = require("../mqtt/connect");

// Import middleware
const authenticateUser = require("../middleware/authenticationUser");
const authenticateAdmin = require("../middleware/authenticationAdmin");
const notFoundMiddleware = require("../middleware/not-found");
const errorHandlerMiddleware = require("../middleware/error-handler");

// Import routes
const authRouter = require("../routes/auth");
const userRouter = require("../routes/user");
const boardRouter = require("../routes/board");
const sensorRouter = require("../routes/sensor");
const notificationRouter = require("../routes/notification");
const dashboardRouter = require("../routes/dashboard");
const sensorDataRouter = require("../routes/sensorData");
const sensorControlRouter = require("../routes/sensorControl");

const express = require("express");
const app = require("../app");

function createServer() {
  const app = express();

  // Middleware setup
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(fileUpload());

  // Secure middlware
  app.use(helmet());
  app.use(xss());

  // Rate limiting middleware
  app.use(
    rateLimiter({
      WindowMs: 15 * 60 * 1000, // 15 minutes
      max: 100000 // limit each IP to 100000 request per window
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: "http://192.168.0.110:3000",
      credentials: true
    })
  );

  // routes
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/board", boardRouter);
  app.use("/api/v1/sensor", sensorRouter);
  app.use("/api/v1/notification", notificationRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/sensorData", sensorDataRouter);
  app.use("/api/v1/sensorControl", sensorControlRouter);

  // Error handler middleware
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}

module.exports = createServer;
