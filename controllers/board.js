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

const addBoard = async (req, res) => {
  const { name, type, location, ip_address, image, userId } = req.body;

  const board = await Board.create({
    name: name,
    type: type,
    location: location,
    ip_address: ip_address,
    image: image,
    userId: userId,
  });

  if (board) {
    res.status(StatusCodes.CREATED).json({
      name: name,
      type: type,
      location: location,
      ip_address: ip_address,
      image: image,
      userId: userId,
    });
  }else{
    throw new BadRequestError("Unable to create new board. Try again later.")
  }
};

module.exports = {
  getAllBoards,
  getBoard,
  addBoard,
};
