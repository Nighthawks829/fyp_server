const { NotFoundError } = require("../errors");
const {
  SensorDataSchema,
  SensorControlsSchema,
  SensorSchema
} = require("../models/associations");
const { StatusCodes } = require("http-status-codes");

const SensorData = SensorDataSchema;
const SensorControl = SensorControlsSchema;

/**
 * Get All Sensor Data
 * 
 * Retrieves raw sensor measurements across all devices
 * Note: Consider adding pagination for production use
 */
const getAllSensorData = async (req, res) => {
  const sensorData = await SensorData.findAll();

  res.status(StatusCodes.OK).json({ sensorData, count: sensorData.length });
};

/**
 * Get Combined Sensor Timeline
 * 
 * Merges sensor readings and control commands for a specific sensor
 * Creates unified chronological timeline with:
 * - Measurement data points
 * - Control command entries
 * - Timestamp-based sorting
 */
const getSensorData = async (req, res) => {
  const sensorId = req.params.id;
  // const sensorData = await SensorData.findByPk(sensorDataId);

  // Get sensor measurements 
  const sensorData = await SensorData.findAll({
    where: { sensorId: sensorId },
    order: [["createdAt", "ASC"]]
  });

  // Get control commands
  const sensorControls = await SensorControl.findAll({
    where: { sensorId: sensorId },
    order: [["createdAt", "ASC"]]
  });

  // Merge and sort data streams
  const combinedData = [...sensorData, ...sensorControls].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Format unified response
  const formattedData = combinedData.map((entry) => {
    if (entry instanceof SensorData) {
      return {
        sensorId: sensorId,
        type: "SensorData",
        data: entry.data,
        createdAt: entry.createdAt
      };
    } else if (entry instanceof SensorControl) {
      return {
        sensorId: sensorId,
        type: "SensorControl",
        data: entry.value,    // Control command value
        createdAt: entry.createdAt
      };
    }
  });

  res
    .status(StatusCodes.OK)
    .json({ sensorData: formattedData, count: formattedData.length });
};

/**
 * Get Latest Sensor Entry
 * 
 * Retrieves most recent entry (data or control) for a sensor
 * Useful for real-time dashboards and device state monitoring
 */
const getLatestSensorData = async (req, res) => {
  const sensorId = req.params.id;
  // const sensorData = await SensorData.findByPk(sensorDataId);

  // Get historical data
  const sensorData = await SensorData.findAll({
    where: { sensorId: sensorId },
    order: [["createdAt", "ASC"]]
  });

  // Get control history
  const sensorControls = await SensorControl.findAll({
    where: { sensorId: sensorId },
    order: [["createdAt", "ASC"]]
  });

  // Combine and sort entries
  const combinedData = [...sensorData, ...sensorControls].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Format and return last entry
  const formattedData = combinedData.map((entry) => {
    if (entry instanceof SensorData) {
      return {
        sensorId: sensorId,
        type: "SensorData",
        data: entry.data,
        unit: entry.unit,
        createdAt: entry.createdAt
      };
    } else if (entry instanceof SensorControl) {
      return {
        sensorId: sensorId,
        type: "SensorControl",
        data: entry.value,
        createdAt: entry.createdAt
      };
    }
  });

  res.status(StatusCodes.OK).json({
    sensorData: formattedData[formattedData.length - 1]   // Return last entry
  });
};

/**
 * Add Sensor Data
 * 
 * Stores new sensor measurements with automatic sensor identification
 * via MQTT topic. Typical flow:
 * 1. Device publishes data to MQTT topic
 * 2. IoT gateway forwards to this endpoint
 * 3. System stores with proper sensor association
 */
const addSensorData = async (req, res) => {
  const { topic, data, unit } = req.body;

  // Find sensor by MQTT topic
  const sensor = await SensorSchema.findOne({
    where: {
      topic: topic
    }
  });

  if (!sensor) {
    throw new NotFoundError(`Sensor with topic ${topic} not found`);
  }

  // Create data record
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
