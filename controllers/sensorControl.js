const { SensorControlsSchema } = require("../models/associations");
const mqtt = require("../mqtt/connect");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");

const SensorControl = SensorControlsSchema;

/**
 * Get All Sensor Controls
 * 
 * Retrieves complete history of sensor control operations
 * Note: Consider adding pagination for production use
 */
const getAllSensorControls = async (req, res) => {
  const sensorControls = await SensorControl.findAll();

  res
    .status(StatusCodes.OK)
    .json({ sensorControls, count: sensorControls.length });
};

/**
 * Get Single Control Entry
 * 
 * Retrieves specific control history entry
 * Useful for auditing and command tracking
 */
const getSensorControl = async (req, res) => {
  const sensorControlId = req.params.id;

  const sensorControl = await SensorControl.findByPk(sensorControlId);

  if (sensorControl) {
    res.status(StatusCodes.OK).json({
      sensorControl: {
        sensorControlId: sensorControl.id,
        userId: sensorControl.userId,
        sensorId: sensorControl.sensorId,
        value: sensorControl.value
      }
    });
  } else {
    throw new NotFoundError(`No sensor control with id ${sensorControlId}`);
  }
};

/**
 * Create New Sensor Control
 * 
 * Handles two main operations:
 * 1. Records control command in database
 * 2. Publishes real-time command via MQTT
 * 
 * Security Note: Consider adding ownership validation
 * for production systems
 */
const addSensorControl = async (req, res) => {
  const { userId, sensorId, value, topic, unit } = req.body;

  // Create control history record
  const sensorControl = await SensorControl.create({
    userId: userId,
    sensorId: sensorId,
    value: value
  });

  // Publish real-time control command
  const payload = JSON.stringify({
    value: value,
    unit: unit
  });
  mqtt.publish(topic, payload);

  if (sensorControl) {
    res.status(StatusCodes.CREATED).json({
      sensorControl: {
        sensorControlId: sensorControl.id,
        userId: sensorControl.userId,
        sensorId: sensorControl.sensorId,
        value: sensorControl.value
      }
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
  addSensorControl
};
