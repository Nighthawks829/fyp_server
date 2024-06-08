const {
  SensorControlsSchema,
  SensorSchema,
  SensorDataSchema,
  DashboardSchema,
} = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");

const Sensor = SensorSchema;

const getAllSensors = async (req, res) => {
  const sensors = await Sensor.findAll();

  res.status(StatusCodes.OK).json({ sensors, count: sensors.length });
};

const getSensor = async (req, res) => {
  const sensor = await Sensor.findByPk(req.params.id);

  if (sensor) {
    res.status(StatusCodes.OK).json({
      sensor: {
        sensorId: sensor.id,
        boardId: sensor.boardId,
        name: sensor.name,
        pin: sensor.pin,
        type: sensor.type,
        topic: sensor.topic,
        image: sensor.image,
      },
    });
  } else {
    throw new NotFoundError(`No sensor with id ${req.params.id}`);
  }
};

const addSensor = async (req, res) => {
  const { boardId, name, pin, type, topic, image } = req.body;

  const sensor = await Sensor.create({
    boardId: boardId,
    name: name,
    pin: pin,
    type: type,
    topic: topic,
    image: image,
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
        image: image,
      },
    });
  } else {
    throw new BadRequestError("Unable to creata new sensor. Try again later");
  }
};

const updateSensor = async (req, res) => {
  const {
    body: { boardId, name, pin, type, topic, image },
    params: { id: sensorId },
  } = req;

  const sensor = await Sensor.findByPk(sensorId);

  sensor.boardId = boardId;
  sensor.name = name;
  sensor.pin = pin;
  sensor.type = type;
  sensor.topic = topic;
  sensor.image = image;

  if (!boardId || !name || !pin || !type || !topic || !image) {
    throw new BadRequestError("Please provide all values");
  }

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
      image: sensor.image,
    },
  });
};

const deleteSensor = async (req, res) => {
  const sensorId = req.params.id;
  const sensor = await Sensor.destroy({
    where: {
      id: sensorId,
    },
  });

  if (!sensor) {
    throw new NotFoundError(`No sensor with id ${sensorId}`);
  }

  res.status(StatusCodes.OK).json({ msg: `Success delete sensor ${sensorId}` });
};

const getSensorWithSensorControls = async (req, res) => {
  const sensor = await Sensor.findByPk(req.params.id, {
    include: [
      {
        model: SensorControlsSchema,
        as: "sensorControls",
      },
    ],
  });

  if (sensor) {
    res.status(StatusCodes.OK).json({
      sensor: {
        sensorId: sensor.id,
        boardId: sensor.boardId,
        name: sensor.name,
        pin: sensor.pin,
        type: sensor.type,
        topic: sensor.topic,
        image: sensor.image,
        sensorControls: sensor.sensorControls,
      },
    });
  } else {
    throw new NotFoundError(`No sensor with id ${req.params.id}`);
  }
};

const getSensorWithSensorData = async (req, res) => {
  const sensor = await Sensor.findByPk(req.params.id, {
    include: [
      {
        model: SensorDataSchema,
        as: "sensorData",
      },
    ],
  });

  if (sensor) {
    res.status(StatusCodes.OK).json({
      sensor: {
        sensorId: sensor.id,
        boardId: sensor.boardId,
        name: sensor.name,
        pin: sensor.pin,
        type: sensor.type,
        topic: sensor.topic,
        image: sensor.image,
        sensorData: sensor.sensorData,
      },
    });
  } else {
    throw new NotFoundError(`No sensor with id ${req.params.id}`);
  }
};

const getSensorWithDashboards = async (req, res) => {
  const sensor = await Sensor.findByPk(req.params.id);

  if (sensor) {
    res.status(StatusCodes.OK).json({
      sensor: {
        sensorId: sensor.id,
        boardId: sensor.boardId,
        name: sensor.name,
        pin: sensor.pin,
        type: sensor.type,
        topic: sensor.topic,
        image: sensor.image,
      },
    });
  } else {
    throw new NotFoundError(`No sensor with id ${req.params.id}`);
  }
};

module.exports = {
  getAllSensors,
  getSensor,
  addSensor,
  updateSensor,
  deleteSensor,
};
