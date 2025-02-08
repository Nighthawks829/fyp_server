// Import required Sequelize components
const { DataTypes, Sequelize } = require("sequelize");
// Database connection instance
const sequelize = require("../db/connect");

/**
 * Sensor Control History Model
 * 
 * Tracks historical control actions performed by users on sensors.
 * Acts as an audit log for sensor manipulation operations.
 */
const SensorControlsSchema = sequelize.define(
  "SensorControls",
  {
    // Unique identifier using UUIDv4
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,   // Auto-generated unique ID
      primaryKey: true,
      allowNull: false,
    },

    // Reference to the user who performed the control action
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Reference to the controlled sensor
    sensorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Control value sent to the sensor
    value: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isNumeric: {
          args: true,
          msg: "Sensor value should be numeric",    // Ensures valid sensor input
        },
      },
    },

    // Timestamp of the control action
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,    // Automatic timestamp on creation
    },
  },
  {
    // Model configuration
    timestamps: false,    // Disable automatic timestamps (using manual createdAt)
    freezeTableName: true,    // Prevent table name pluralization
  }
);

// Synchronize model with database
sequelize
  .sync()
  .then(() => {
    console.log("SensorControls table created successfully");
  })
  .catch((error) => {
    console.log("Unable to created SensorControls table: ", error);
  });

module.exports = SensorControlsSchema;
