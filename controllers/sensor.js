const {
  SensorSchema,
  SensorDataSchema,
  BoardSchema
} = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");
const path = require("path");

const Sensor = SensorSchema;

/**
 * Get All Sensors
 * 
 * Retrieves all sensors with their associated board information
 * Formats the response to include board names
 */
const getAllSensors = async (req, res) => {
  // Fetch all sensors with associated board data
  const sensors = await Sensor.findAll({
    include: {
      model: BoardSchema,
      as: "board",
      attributes: ["name"]
    }
  });

  // Format response to flatten board relationship
  const formattedSensors = sensors.map((sensor) => ({
    id: sensor.id,
    boardId: sensor.boardId,
    name: sensor.name,
    pin: sensor.pin,
    type: sensor.type,
    topic: sensor.topic,
    image: sensor.image,
    boardName: sensor.board.name     // Extract board name from association
  }));

  res
    .status(StatusCodes.OK)
    .json({ sensors: formattedSensors, count: sensors.length });
};

/**
 * Get Single Sensor
 * 
 * Retrieves a specific sensor by ID with its associated board information
 * Includes latest sensor data value from historical records
 */
const getSensor = async (req, res) => {
  const sensor = await Sensor.findByPk(req.params.id, {
    include: [
      {
        model: BoardSchema,
        as: "board",
        attributes: ["name"]
      }
    ]
  });

  if (sensor) {
    // Get most recent sensor data entry
    const latestControl = await SensorDataSchema.findOne({
      where: { sensorId: sensor.id },
      order: [["createdAt", "DESC"]]
    });

    res.status(StatusCodes.OK).json({
      sensor: {
        sensorId: sensor.id,
        boardId: sensor.boardId,
        name: sensor.name,
        pin: sensor.pin,
        type: sensor.type,
        topic: sensor.topic,
        image: sensor.image,
        boardName: sensor.board ? sensor.board.name : null,
        value: latestControl ? latestControl.dataValues.data : null
      }
    });
  } else {
    throw new NotFoundError(`No sensor with id ${req.params.id}`);
  }
};

/**
 * Create New Sensor
 * 
 * Handles sensor creation with image upload validation
 * Supports JPG, JPEG, and PNG image formats
 * Stores image in public uploads directory
 */
const addSensor = async (req, res) => {
  const { boardId, name, pin, type, topic } = req.body;
  let image = "";
  const file = req.files.image;

  // Handle image upload if present
  if (req.files && req.files.image) {
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = path.extname(file.name).toLowerCase();

    // Validate file type
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestError(
        "Invalid file type. Only image files are allowed"
      );
    }

    // Move file to uploads directory
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

  // Create sensor record
  const sensor = await Sensor.create({
    boardId: boardId,
    name: name,
    pin: pin,
    type: type,
    topic: topic,
    image: image
  });

  if (sensor) {
    res.status(StatusCodes.CREATED).json({
      sensor: {
        sensorId: sensor.id,
        boardId: boardId,
        name: name,
        pin: pin,
        type: type,
        topic: topic,
        image: image
      }
    });
  } else {
    throw new BadRequestError("Unable to creata new sensor. Try again later");
  }
};

/**
 * Update Existing Sensor
 * 
 * Handles sensor updates with optional image replacement
 * Requires all sensor properties for update
 * Maintains data integrity through full updates
 */
const updateSensor = async (req, res) => {
  const {
    body: { boardId, name, pin, type, topic },
    params: { id: sensorId }
  } = req;
  let image = "";

  // Validate required fields
  if (!boardId || !name || !pin || !type || !topic) {
    throw new BadRequestError("Please provide all values");
  }

  const sensor = await Sensor.findByPk(sensorId);

  if (!sensor) {
    throw new NotFoundError(`No sensor with id ${sensorId}`);
  }

  // Handle image update if provided
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

  // Update sensor properties
  sensor.boardId = boardId;
  sensor.name = name;
  sensor.pin = pin;
  sensor.type = type;
  sensor.topic = topic;
  sensor.image = image;

  await sensor.save();

  res.status(StatusCodes.OK).json({
    sensor: {
      boardId: boardId,
      sensorId: sensorId,
      boardId: sensor.boardId,
      name: sensor.name,
      pin: sensor.pin,
      type: sensor.type,
      topic: sensor.topic,
      image: sensor.image
    }
  });
};

/**
 * Delete Sensor
 * 
 * Removes sensor record from database
 * Uses cascade deletion for associated data (handled at model level)
 */
const deleteSensor = async (req, res) => {
  const sensorId = req.params.id;
  const sensor = await Sensor.destroy({
    where: {
      id: sensorId
    }
  });

  if (!sensor) {
    throw new NotFoundError(`No sensor with id ${sensorId}`);
  }

  res.status(StatusCodes.OK).json({ msg: `Success delete sensor ${sensorId}` });
};

module.exports = {
  getAllSensors,
  getSensor,
  addSensor,
  updateSensor,
  deleteSensor
};
