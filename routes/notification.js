const express = require("express");
const router = express.Router();

const {
  getAllNotifications,
  getNotification,
  addNotification,
  updateNotification,
  deleteNotification,
} = require("../controllers/notification");

const authenticateUser = require("../middleware/authenticationUser");
const authenticateAdmin = require("../middleware/authenticationAdmin");

router
  .route("/")
  .get(authenticateUser, getAllNotifications)
  .post(authenticateAdmin, addNotification);

router
  .route("/:id")
  .get(authenticateUser, getNotification)
  .patch(authenticateAdmin, updateNotification)
  .delete(authenticateAdmin, deleteNotification);

module.exports = router;
