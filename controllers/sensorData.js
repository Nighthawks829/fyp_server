const {
  SensorDataSchema,
  SensorSchema,
  SensorControlsSchema
} = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const SensorData = SensorDataSchema;
const SensorControl = SensorControlsSchema;
const getAllSensorData = async (req, res) => {
  const sensorData = await SensorData.findAll();

  res.status(StatusCodes.OK).json({ sensorData, count: sensorData.length });
};

const getSensorData = async (req, res) => {
  const sensorId = req.params.id;
  // const sensorData = await SensorData.findByPk(sensorDataId);
  const sensorData = await SensorData.findAll({
    where: { sensorId: sensorId },
    order: [["createdAt", "ASC"]]
  });

  const sensorControls = await SensorControl.findAll({
    where: { sensorId: sensorId },
    order: [["createdAt", "ASC"]]
  });

  const combinedData = [...sensorData, ...sensorControls].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const formattedData = combinedData.map((entry) => {
    if (entry instanceof SensorData) {
      return {
        type: "SensorData",
        data: entry.data,
        createdAt: entry.createdAt
      };
    } else if (entry instanceof SensorControl) {
      return {
        type: "SensorControl",
        data: entry.value,
        createdAt: entry.createdAt
      };
    }
  });

  res
    .status(StatusCodes.OK)
    .json({ sensorData: formattedData, count: formattedData.length });
};

const getLatestSensorData = async (req, res) => {
  const sensorId = req.params.id;
  // const sensorData = await SensorData.findByPk(sensorDataId);
  const sensorData = await SensorData.findAll({
    where: { sensorId: sensorId },
    order: [["createdAt", "ASC"]]
  });

  const sensorControls = await SensorControl.findAll({
    where: { sensorId: sensorId },
    order: [["createdAt", "ASC"]]
  });

  const combinedData = [...sensorData, ...sensorControls].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const formattedData = combinedData.map((entry) => {
    if (entry instanceof SensorData) {
      return {
        type: "SensorData",
        data: entry.data,
        createdAt: entry.createdAt
      };
    } else if (entry instanceof SensorControl) {
      return {
        type: "SensorControl",
        data: entry.value,
        createdAt: entry.createdAt
      };
    }
  });


  res.status(StatusCodes.OK).json({
    sensorData: formattedData[formattedData.length - 1],
  });
};

const addSensorData = async (req, res) => {
  const { topic, data, unit } = req.body;

  const sensor = await SensorSchema.findOne({
    where: {
      topic: topic
    }
  });

  const sensorData = await SensorData.create({
    sensorId: sensor.id,
    data: data,
    unit: unit
  });

  if (sensorData) {
    res.status(StatusCodes.CREATED).json({
      sensorData: {
        sensorDataId: sensorData.id,
        sensorId: sensorData.sensorId,
        data: sensorData.data,
        unit: sensorData.unit
      }
    });
  } else {
    throw new BadRequestError(
      "Unable to create new sensor data. Try again later"
    );
  }
};

module.exports = {
  getAllSensorData,
  getSensorData,
  getLatestSensorData,
  addSensorData
};
