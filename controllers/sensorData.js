const SensorData = require("../models/SensorData");
const Sensor = require("../models/Sensors");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllSensorData = async (req, res) => {
  const sensorData = await SensorData.findAll();

  res.status(StatusCodes.OK).json({ sensorData, count: sensorData.length });
};

const getSensorData = async (req, res) => {
  const sensorDataId = req.params.id;
  const sensorData = await SensorData.findByPk(sensorDataId);

  if (sensorData) {
    res.status(StatusCodes.OK).json({
      sensorData: {
        sensorDataId: sensorData.id,
        sensorId: sensorData.sensorId,
        data: sensorData.data,
        unit: sensorData.unit,
      },
    });
  } else {
    throw new NotFoundError(`No sensor data with id ${sensorDataId}`);
  }
};

const addSensorData = async (req, res) => {
  const { topic, data, unit } = req.body;

  const sensor = await Sensor.findOne({
    where: {
      topic: topic,
    },
  });

  const sensorData = await SensorData.create({
    sensorId: sensor.id,
    data: data,
    unit: unit,
  });

  if (sensorData) {
    res.status(StatusCodes.CREATED).json({
      sensorData: {
        sensorDataId: sensorData.id,
        sensorId: sensorData.sensorId,
        data: sensorData.data,
        unit: sensorData.unit,
      },
    });
  } else {
    throw new BadRequestError(
      "Unable to create new sensor data. Try again later"
    );
  }
};

module.exports = { getAllSensorData, getSensorData, addSensorData };
