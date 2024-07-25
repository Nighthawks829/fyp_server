const { SensorControlsSchema } = require("../models/associations");
const mqtt = require("../mqtt/connect");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");

const SensorControl = SensorControlsSchema;

const getAllSensorControls = async (req, res) => {
  const sensorControls = await SensorControl.findAll();

  res
    .status(StatusCodes.OK)
    .json({ sensorControls, count: sensorControls.length });
};

const getSensorControl = async (req, res) => {
  const sensorControlId = req.params.id;

  const sensorControl = await SensorControl.findByPk(sensorControlId);

  if (sensorControl) {
    res.status(StatusCodes.OK).json({
      sensorControl: {
        sensorControlId: sensorControl.id,
        userId: sensorControl.userId,
        sensorId: sensorControl.sensorId,
        value: sensorControl.value,
      },
    });
  } else {
    throw new NotFoundError(`No sensor control with id ${sensorControlId}`);
  }
};

const addSensorControl = async (req, res) => {
  const { userId, sensorId, value, topic,unit } = req.body;

  const sensorControl = await SensorControl.create({
    userId: userId,
    sensorId: sensorId,
    value: value,
  });

  // const sensor = await Sensor.findByPk(sensorId);
  // const topic = sensor.topic;
  const payload=JSON.stringify({
    value:value,
    unit:unit,
  })
  mqtt.publish(topic,payload );


  if (sensorControl) {
    res.status(StatusCodes.CREATED).json({
      sensorControl: {
        sensorControlId: sensorControl.id,
        userId: sensorControl.userId,
        sensorId: sensorControl.sensorId,
        value: sensorControl.value,
      },
    });
  } else {
    throw new BadRequestError(
      "Unable to create new sensor control. Try again later"
    );
  }
};

module.exports = {
  getAllSensorControls,
  getSensorControl,
  addSensorControl,
};
