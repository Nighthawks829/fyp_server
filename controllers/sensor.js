const {
  SensorControlsSchema,
  SensorSchema,
  SensorDataSchema,
  DashboardSchema,
  NotificationSchema,
  BoardSchema,
} = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");

const Sensor = SensorSchema;

const getAllSensors = async (req, res) => {
  const sensors = await Sensor.findAll({
    include: {
      model: BoardSchema,
      as: "board",
      attributes: ["name"],
    },
  });

  const formattedSensors = sensors.map((sensor) => ({
    id: sensor.id,
    boardId: sensor.boardId,
    name: sensor.name,
    pin: sensor.pin,
    type: sensor.type,
    topic: sensor.topic,
    image: sensor.image,
    boardName: sensor.board.name, // Include the board name
    // Add other sensor attributes as needed
  }));

  res
    .status(StatusCodes.OK)
    .json({ sensors: formattedSensors, count: sensors.length });
};

const getSensor = async (req, res) => {
  const sensor = await Sensor.findByPk(req.params.id, {
    include: [
      {
        model: BoardSchema,
        as: "board",
        attributes: ["name"],
      },
    ],
  });

  if (sensor) {
    const latestControl = await SensorControlsSchema.findOne({
      where: { sensorId: sensor.id },
      order: [["createdAt", "DESC"]],
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
        value: latestControl ? latestControl.value : null,
      },
    });
  } else {
    throw new NotFoundError(`No sensor with id ${req.params.id}`);
  }
};

const addSensor = async (req, res) => {
  const { boardId, name, pin, type, topic } = req.body;
  let image = "";

  if (req.files && req.files.image) {
    const file = req.files.image;
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
    body: { boardId, name, pin, type, topic },
    params: { id: sensorId },
  } = req;
  let image = "";
  
  if (!boardId || !name || !pin || !type || !topic) {
    throw new BadRequestError("Please provide all values");
  }

  const sensor = await Sensor.findByPk(sensorId);

  if (req.files && req.files.image) {
    const file = req.files.image;
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
  const sensor = await Sensor.findByPk(req.params.id, {
    include: [
      {
        model: DashboardSchema,
        as: "dashboards",
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
        dashboards: sensor.dashboards,
      },
    });
  } else {
    throw new NotFoundError(`No sensor with id ${req.params.id}`);
  }
};

const getSensorWithNotifications = async (req, res) => {
  const sensor = await Sensor.findByPk(req.params.id, {
    include: [
      {
        model: NotificationSchema,
        as: "notifications",
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
        notifications: sensor.notifications,
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
