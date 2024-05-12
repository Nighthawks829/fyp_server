const express = require("express");
const router = express.Router();
const {
  getAllBoards,
  getBoard,
  addBoard,
  updateBoard,
  deleteBoard,
} = require("../controllers/board");

const authenticateUser = require("../middleware/authenticationUser");
const authenticateAdmin = require("../middleware/authenticationAdmin");

router
  .route("/")
  .get(authenticateUser, getAllBoards)
  .post(authenticateAdmin, addBoard);
router
  .route("/:id")
  .get(authenticateUser, getBoard)
  .patch(authenticateAdmin, updateBoard)
  .delete(authenticateAdmin, deleteBoard);

module.exports = router;
