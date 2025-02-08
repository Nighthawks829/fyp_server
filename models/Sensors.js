// Import required Sequelize components
const { DataTypes, Sequelize } = require("sequelize");
// Database connection instance
const sequelize = require("../db/connect");


/**
 * Sensor Model Definition
 * 
 * Represents physical IoT sensors connected to boards in the system.
 * Includes MQTT integration and hardware configuration details.
 */
const SensorSchema = sequelize.define(
  "Sensors",
  {
    // Unique identifier using UUIDv4
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,   // Auto-generated unique ID
      primaryKey: true,
      allowNull: false,
    },

    // Reference to parent board (foreign key to Boards table)
    boardId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Human-readable sensor name
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 50],
          msg: "Sensor name should be between 2 and 50 characters",
        },
      },
    },

    // Hardware pin configuration
    pin: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: {
          args: true,
          msg: "Please provide a valid pin number",   // Enforces digital/analog pin format
        },
      },
    },

    // Sensor type classification
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: [
        "Digital Input",    // Read-only digital sensor
        "Digital Output",   // Write-only digital actuator
        "Analog Input",     // Read-only analog sensor
        "Analog Output",    // Write-only analog actuator
      ],
    },

    // MQTT communication channel
    topic: {
      type: DataTypes.STRING,
      unique: true,   // Ensure unique MQTT topics
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          // MQTT topic length constraints
          msg: "Topic length should be between 2 and 100 characters",
        },
      },
    },

    // Visual representation URL
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",   // Empty string default for consistency
    },

    // Manual timestamp management
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    // Model configuration
    timestamps: false,    // Disable automatic timestamps
    freezeTableName: true,    // Prevent table name pluralization
    hooks: {
      // Auto-update timestamp before any update
      beforeUpdate: async (sensor) => {
        sensor.updatedAt = new Date();
      },
    },
  }
);

// Synchronize model with database
sequelize
  .sync()
  .then(() => {
    console.log("Sensors table created successfully");
  })
  .catch((error) => {
    console.log("Unable to created Sensors table: ", error);
  });

module.exports = SensorSchema;
