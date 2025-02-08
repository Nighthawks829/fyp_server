const express = require("express");
const router = express.Router();
const {
  getAllBoards,
  getBoard,
  addBoard,
  updateBoard,
  deleteBoard,
} = require("../controllers/board");

// Import authentication middleware
const authenticateUser = require("../middleware/authenticationUser");
const authenticateAdmin = require("../middleware/authenticationAdmin");

/**
 * Base route: '/api/boards'
 * 
 * GET / - Retrieve all boards (User authentication required)
 * POST / - Create new board (Admin authentication required)
 */
router
  .route("/")
  .get(authenticateUser, getAllBoards)
  .post(authenticateAdmin, addBoard);

/**
* ID parameter routes: '/api/boards/:id'
* 
* GET /:id - Get single board by ID (User authentication required)
* PATCH /:id - Update board by ID (Admin authentication required)
* DELETE /:id - Delete board by ID (Admin authentication required)
*/
router
  .route("/:id")
  .get(authenticateUser, getBoard)
  .patch(authenticateAdmin, updateBoard)
  .delete(authenticateAdmin, deleteBoard);

module.exports = router;
