const { BoardSchema, SensorSchema } = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");
const path = require("path");

// Rename BoardSchema to Board
const Board = BoardSchema;

const getAllBoards = async (req, res) => {
  const boards = await Board.findAll();

  res.status(StatusCodes.OK).json({ boards, count: boards.length });
};

const getBoard = async (req, res) => {
  const board = await Board.findByPk(req.params.id, {
    include: [
      {
        model: SensorSchema,
        as: "sensors"
      }
    ]
  });

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
        sensors: board.sensors
      }
    });
  } else {
    throw new NotFoundError(`No board with id ${req.params.id}`);
  }
};

const addBoard = async (req, res) => {
  const { name, type, location, ip_address, userId } = req.body;
  let image = "";

  if (req.files && req.files.image) {
    const file = req.files.image;

    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestError(
        "Invalid file type. Only image files are allowed"
      );
    }

    image = file.name;
    const uploadPath = `${__dirname}/../../client/public/uploads/${file.name}`;

    file.mv(uploadPath, (error) => {
      if (error) {
        console.error(error);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: error });
      }
    });
  }

  const board = await Board.create({
    name: name,
    type: type,
    location: location,
    ip_address: ip_address,
    image: image,
    userId: userId
  });

  if (board) {
    res.status(StatusCodes.CREATED).json({
      board: {
        boardId: board.id,
        name: name,
        type: type,
        location: location,
        ip_address: ip_address,
        image: board.image,
        userId: userId
      }
    });
  } else {
    throw new BadRequestError("Unable to create new board. Try again later.");
  }
};

const updateBoard = async (req, res) => {
  const {
    body: { name, type, location, ip_address, userId },
    params: { id: boardId }
  } = req;
  let image = "";

  if (!name || !type || !location || !ip_address || !userId) {
    throw new BadRequestError("Please provide all values");
  }

  const board = await Board.findByPk(boardId);

  console.log(board)

  // Store the old data
  const oldData = {
    name: board.name,
    type: board.type,
    location: board.location,
    ip_address: board.ip_address,
    image: board.image
  };

  if (req.files && req.files.image) {
    const file = req.files.image;

    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestError(
        "Invalid file type. Only image files are allowed"
      );
    }

    image = file.name;
    const uploadPath = `${__dirname}/../../client/public/uploads/${file.name}`;
    file.mv(uploadPath, (error) => {
      if (error) {
        console.error(error);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: error });
      }
    });
  }

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
      userId: userId
    }
  });
};

const deleteBoard = async (req, res) => {
  const boarId = req.params.id;

  const board = await Board.destroy({
    where: {
      id: boarId
    }
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
  deleteBoard
};
