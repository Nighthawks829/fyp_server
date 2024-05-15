const express = require("express");
const router = express.Router();

const {
  getAllDashboard,
  getDashboard,
  addDashboard,
  updateDashboard,
  deleteDashboard,
} = require("../controllers/dashboard");

const authenticateUser = require("../middleware/authenticationUser");

router
  .route("/")
  .get(authenticateUser, getAllDashboard)
  .post(authenticateUser, addDashboard);

router
  .route("/:id")
  .get(authenticateUser, getDashboard)
  .patch(authenticateUser, updateDashboard)
  .delete(authenticateUser, deleteDashboard);

module.exports = router;
