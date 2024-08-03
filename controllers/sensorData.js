const { SensorDataSchema, SensorSchema } = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const SensorData = SensorDataSchema;
const getAllSensorData = async (req, res) => {
  const sensorData = await SensorData.findAll();

  res.status(StatusCodes.OK).json({ sensorData, count: sensorData.length });
};

const getSensorData = async (req, res) => {
  const sensorId = req.params.id;
  // const sensorData = await SensorData.findByPk(sensorDataId);
  const sensorData = await SensorData.findAll({
    where: { sensorId: sensorId },
    order:[['createdAt', 'ASC']]
  });

  const formattedSensorData = sensorData.map((sensorData) => ({
    data: sensorData.data,
  }));

  res
    .status(StatusCodes.OK)
    .json({ sensorData: formattedSensorData, count: sensorData.length });

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

module.exports = { getAllSensorData, getSensorData, addSensorData };
