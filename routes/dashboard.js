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

router.route("/").post(authenticateUser, addDashboard);

router.route("/getAllDashboards/:id").get(authenticateUser, getAllDashboard);

router
  .route("/:id")
  .get(authenticateUser, getDashboard)
  .patch(authenticateUser, updateDashboard)
  .delete(authenticateUser, deleteDashboard);

module.exports = router;
