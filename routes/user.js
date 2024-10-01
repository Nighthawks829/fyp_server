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

// 1000 request in development. 100 requests for production environment
const apiLimiter = rateLimiter({
  windowMs: process.env.RATE_WINDOWMS,
  max: process.env.RATE_MAX,
  message: {
    msg: "Too many request from this IP. Please try again after 15 minutes",
  },
});

router
  .route("/")
  .get(authenticateAdmin, getAllUsers)
  .post(authenticateAdmin, addUser);

router
  .route("/:id")
  .get(authenticateUser, getUser)
  .patch(authenticateUser, updateUser)
  .delete(authenticateAdmin, deleteUser);

module.exports = router;
