require("dotenv").config();
require("express-async-errors");

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const express = require("express");
const app = express();

const sequelize = require("./db/connect");

// import middleware
const authenticateUser = require("./middleware/authentication");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// import routes

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

// Test API
app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>");
});

// routes

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
