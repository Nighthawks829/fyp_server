const express = require("express");
const router = express.Router();
const { getAllBoards, getBoard, addBoard } = require("../controllers/board");

const authenticateUser = require("../middleware/authenticationUser");
const authenticateAdmin = require("../middleware/authenticationAdmin");

router
  .route("/")
  .get(authenticateUser, getAllBoards)
  .post(authenticateAdmin, addBoard);
router.route("/:id").get(authenticateUser, getBoard);

module.exports = router;
