const { BoardSchema, SensorSchema } = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");
const path = require("path");

// Rename BoardSchema to Board for clarity
const Board = BoardSchema;

/**
 * Get All Boards
 * Retrieves a list of all IoT boards in the system.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllBoards = async (req, res) => {
  // Fetch all boards from the database
  const boards = await Board.findAll();

  // Return boards with count
  res.status(StatusCodes.OK).json({ boards, count: boards.length });
};

/**
 * Get Single Board by ID
 * Retrieves a specific board by its ID, including its associated sensors.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBoard = async (req, res) => {
  const board = await Board.findByPk(req.params.id, {
    include: [
      {
        model: SensorSchema,
        as: "sensors"   // Include associated sensors using the defined association
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
        sensors: board.sensors    // Include sensor data in the response
      }
    });
  } else {
    throw new NotFoundError(`No board with id ${req.params.id}`);
  }
};

/**
 * Add a New Board
 * Creates a new IoT board with optional image upload.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addBoard = async (req, res) => {
  const { name, type, location, ip_address, userId } = req.body;
  let image = "";

  // Handle image upload if present in the request
  if (req.files && req.files.image) {
    const file = req.files.image;

    // Validate file type (only JPG, JPEG, PNG allowed)
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestError(
        "Invalid file type. Only image files are allowed"
      );
    }

    image = file.name;
    const uploadPath = `${__dirname}/../../client/public/uploads/${file.name}`;

    // Move the uploaded file to the specified directory
    file.mv(uploadPath, (error) => {
      if (error) {
        console.error(error);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: error });
      }
    });
  }

  // Create the new board in the database
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

/**
 * Update an Existing Board
 * Updates the details of an existing IoT board, including optional image upload.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateBoard = async (req, res) => {
  const {
    body: { name, type, location, ip_address, userId },
    params: { id: boardId }
  } = req;
  let image = "";

  // Validate required fields
  if (!name || !type || !location || !ip_address || !userId) {
    throw new BadRequestError("Please provide all values");
  }

  // Find the board by ID
  const board = await Board.findByPk(boardId);

  if (!board) {
    throw new NotFoundError(`No board with id ${boardId}`);
  }

  // Store the old data for comparison
  const oldData = {
    name: board.name,
    type: board.type,
    location: board.location,
    ip_address: board.ip_address,
    image: board.image
  };

  // Handle image upload if present in the request
  if (req.files && req.files.image) {
    const file = req.files.image;

    // Validate file type (only JPG, JPEG, PNG allowed)
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestError(
        "Invalid file type. Only image files are allowed"
      );
    }

    image = file.name;
    const uploadPath = `${__dirname}/../../client/public/uploads/${file.name}`;

    // Move the uploaded file to the specified directory
    file.mv(uploadPath, (error) => {
      if (error) {
        console.error(error);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: error });
      }
    });
  }

  // Update the board fields
  board.name = name;
  board.type = type;
  board.location = location;
  board.ip_address = ip_address;
  board.image = image;

  // Save the updated board to the database
  const response = await board.save();

  if (response) {
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
  } else {
    throw new BadRequestError("Unable to update this board. Try again later.");
  }
};

/**
 * Delete a Board
 * Deletes an IoT board by its ID.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteBoard = async (req, res) => {
  const boardId = req.params.id;

  // Delete the board from the database
  const board = await Board.destroy({
    where: {
      id: boardId
    }
  });
  if (!board) {
    throw new NotFoundError(`No board with id ${boardId}`);
  }

  res.status(StatusCodes.OK).json({ msg: `Success delete board ${boardId}` });
};
module.exports = {
  getAllBoards,
  getBoard,
  addBoard,
  updateBoard,
  deleteBoard
};
