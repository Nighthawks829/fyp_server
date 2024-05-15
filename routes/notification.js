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

router
  .route("/")
  .get(authenticateUser, getAllNotifications)
  .post(authenticateUser, addNotification);

router
  .route("/:id")
  .get(authenticateUser, getNotification)
  .patch(authenticateUser, updateNotification)
  .delete(authenticateUser, deleteNotification);

module.exports = router;
