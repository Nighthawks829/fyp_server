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
      board: {
        boardId: board.id,
        name: board.name,
        type: board.type,
        location: board.location,
        ip_address: board.ip_address,
        image: board.image,
        userId: board.userId,
      },
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
      board: {
        boardId: board.id,
        name: name,
        type: type,
        location: location,
        ip_address: ip_address,
        image: image,
        userId: userId,
      },
    });
  } else {
    throw new BadRequestError("Unable to create new board. Try again later.");
  }
};

const updateBoard = async (req, res) => {
  const {
    body: { name, type, location, ip_address, image, userId },
    params: { id: boardId },
  } = req;

  if (!name || !type || !location || !ip_address || !userId) {
    throw new BadRequestError("Please provide all values");
  }

  const board = await Board.findByPk(boardId);

  // Store the old data
  const oldData = {
    name: board.name,
    type: board.type,
    location: board.location,
    ip_address: board.ip_address,
    image: board.image,
  };

  board.name = name;
  board.type = type;
  board.location = location;
  board.ip_address = ip_address;
  board.image = image;

  const respond = await board.save();

  res.status(StatusCodes.OK).json({
    board: {
      boardId: boardId,
      name: board.name,
      type: board.type,
      location: board.location,
      ip_address: board.ip_address,
      image: board.image,
      userId: userId,
    },
  });
};

const deleteBoard = async (req, res) => {
  const boarId = req.params.id;

  const board = await Board.destroy({
    where: {
      id: boarId,
    },
  });
  if (!board) {
    throw new NotFoundError(`No board with id ${boarId}`);
  }

  res.status(StatusCodes.OK).json({ msg: `Success delete board ${boarId}` });
};
module.exports = {
  getAllBoards,
  getBoard,
  addBoard,
  updateBoard,
  deleteBoard,
};
