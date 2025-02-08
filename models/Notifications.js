// Import required Sequelize components
const { DataTypes, Sequelize } = require("sequelize");
// Database connection instance
const sequelize = require("../db/connect");

/**
 * Notification Rule Model
 * 
 * Manages user-configured alert rules that trigger when sensor data meets specified conditions.
 * Handles notification delivery through multiple communication platforms.
 */
const NotificationSchema = sequelize.define(
  "Notifications",
  {
    // Unique identifier using UUIDv4
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,   // Auto-generated unique ID
      primaryKey: true,
      allowNull: false,
    },

    // Reference to user who created the rule
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Reference to monitored sensor
    sensorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Rule name for user identification
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: "Notification name should be between 2 and 100 characters",
        },
      },
    },

    // Notification message template
    message: {
      type: DataTypes.TEXT,   // Supports long messages
      allowNull: false,       // Mandatory message content
    },

    // Threshold value for triggering
    threshold: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isNumeric: {
          args: true,
          msg: "Threshold value shoule be numeric value",
        },
      },
    },

    // Condition for threshold comparison
    condition: {
      type: DataTypes.ENUM,
      values: ["bigger", "lower", "equal"],
      allowNull: false,
    },

    // Delivery platform configuration
    platform: {
      type: DataTypes.ENUM,
      values: ["email", "telegram", "whatsapp", "sms"],   // Supported services
      allowNull: false,
    },

    // Destination address for notifications
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [2, 5000],    // Supports long URLs/phone numbers/emails
          msg: "Address should be between 2 and 5000 characters",
        },
      },
    },

    // Creation timestamp
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    // Last update timestamp
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
      beforeUpdate: async (notification) => {
        notification.updatedAt = new Date();
      },
    },
  }
);

// Synchronize model with database
sequelize
  .sync()
  .then(() => {
    console.log("Notifications table created successfully");
  })
  .catch((error) => {
    console.log("Unable to created Notifications table: ", error);
  });

module.exports = NotificationSchema;
