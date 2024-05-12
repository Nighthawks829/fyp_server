const express = require("express");
const router = express.Router();
const rateLimiter = require("express-rate-limit");
const { addUser, getAllUsers, getUser } = require("../controllers/user");
require("dotenv").config({ path: "../.env" });

// 1000 request in development. 100 requests for production environment
const apiLimiter = rateLimiter({
  windowMs: process.env.RATE_WINDOWMS,
  max: process.env.RATE_MAX,
  message: {
    msg: "Too many request from this IP. Please try again after 15 minutes",
  },
});

router.post("/addUser", addUser);
router.get("/getAllUser", getAllUsers);
router.get("/getUser/:id", getUser);

router.route("/");

module.exports = router;
