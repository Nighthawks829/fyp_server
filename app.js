require("dotenv").config();
require("express-async-errors");

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const express = require("express");
const app = express();

const sequelize = require("./db/connect");

// mqtt server
const mqtt = require("./mqtt/connect");

// import middleware
const authenticateUser = require("./middleware/authenticationUser");
const authenticateAdmin = require("./middleware/authenticationAdmin");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// import routes
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const boardRouter = require("./routes/board");
const sensorRouter = require("./routes/sensor");
const notificationRouter = require("./routes/notification");
const dashboardRouter = require("./routes/dashboard");
const sensorDataRouter = require("./routes/sensorData");
const sensorControlRouter = require("./routes/sensorControl");

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(cookieParser());

// Test API
app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>");
});

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/board", boardRouter);
app.use("/api/v1/sensor", sensorRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/sensorData", sensorDataRouter);
app.use("/api/v1/sensorControl", sensorControlRouter);

// middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize
      .authenticate()
      .then(() => console.log("Connection has been established"));
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

module.exports = app;
