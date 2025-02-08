// Import required modules and dependencies
const { DataTypes, Sequelize, where } = require("sequelize");
const sequelize = require("../db/connect");
const NotificationSchema = require("./Notifications");
const { BadRequestError } = require("../errors");


// Import notification delivery services
const sendEmail = require("../utils/sendEmail");
const sendTelegramMessage = require("../utils/sendTelegramMessage");
const sendWhatsAppMessage = require("../utils/sendWhatsappMessage");
const sendSMSMessage = require("../utils/sendSMSMessage");


/**
 * Sensor Data Model with Alert Triggering
 * 
 * Records sensor measurements and automatically triggers notifications
 * when configured conditions are met.
 */
const SensorDataSchema = sequelize.define(
  "SensorData",
  {
    // Unique identifier using UUIDv4
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },

    // Foreign key reference to Sensors table
    sensorId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    // Sensor measurement value 
    data: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isNumeric: {
          args: true,
          msg: "Sensor data should be numeric"
        }
      }
    },

    // Measurement unit metadata (e.g., "°C", "lux", "dB")
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ""    // Stores measurement unit (e.g., °C, %)
    },

    // Creation timestamp
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false,    // Automatic timestamp
    freezeTableName: true,
    hooks: {
      /**
      * Post-Creation Hook: Alert Trigger System
      * 
      * After new sensor data is inserted:
      * 1. Find all notifications linked to this sensor
      * 2. Check each notification's trigger condition
      * 3. Send alerts through configured platforms if conditions met
      */

      afterCreate: async (sensorData, options) => {

        // Get all notifications for this sensor
        const notifications = await NotificationSchema.findAll({
          where: {
            sensorId: sensorData.sensorId
          }
        });

        // Process each notification rule
        for (const notification of notifications) {
          let shouldNotify = false;

          // Evaluate condition against threshold
          if (
            (notification.condition === "bigger" &&
              sensorData.data > notification.threshold) ||
            (notification.condition === "lower" &&
              sensorData.data < notification.threshold) ||
            (notification.condition === "equal" &&
              sensorData.data === notification.threshold)
          ) {
            shouldNotify = true;
          }

          // Send notification if condition met
          if (shouldNotify) {
            if (notification.platform === "email") {
              // Send email notification
              await sendEmail(
                notification.address,
                notification.name,
                notification.message
              );
            } else if (notification.platform === "telegram") {
              // Send Telegram notification
              await sendTelegramMessage(
                notification.address,
                notification.message
              );
            } else if (notification.platform === "whatsapp") {
              await sendWhatsAppMessage(
                notification.address,
                notification.message
              );
            } else if (notification.platform === "sms") {
              await sendSMSMessage(notification.address, notification.message);
            } else {
              throw new BadRequestError("Invalid notification platform");
            }
          }
        }
      }
    }
  }
);

// Synchronize model with database
sequelize
  .sync()
  .then(() => {
    console.log("SensorData table created successfully");
  })
  .catch((error) => {
    console.log("Unable to created SensorData table: ", error);
  });

module.exports = SensorDataSchema;
