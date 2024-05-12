const Board = require("../models/Boards");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");

const getAllBoards = async (req, res) => {
  const boards = await Board.findAll();

  res.status(StatusCodes.OK).json({ boards, count: boards.length });
};

const getBoard = async (req, res) => {
  const board = await Board.findByPk(req.params.id);

  if (board) {
    res.status(StatusCodes.OK).json({
      boardId: board.id,
      name: board.name,
      type: board.type,
      location: board.location,
      ip_address: board.ip_address,
      image: board.image,
      userId: board.userId,
    });
  } else {
    throw new NotFoundError(`No board with id ${req.params.id}`);
  }
};

module.exports = {
  getAllBoards,
  getBoard
};
