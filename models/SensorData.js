const { DataTypes, Sequelize, where } = require("sequelize");
const sequelize = require("../db/connect");

const SensorSchema = require("./Sensors");
const NotificationSchema = require("./Notifications");

const sendEmail = require("../utils/sendEmail");
const sendTelegramMessage = require("../utils/sendTelegramMessage");
const { BadRequestError } = require("../errors");

const SensorDataSchema = sequelize.define(
  "SensorData",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    sensorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    data: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isNumeric: {
          args: true,
          msg: "Sensor data should be numeric",
        },
      },
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
    hooks: {
      afterCreate: async (sensorData, options) => {
        const notifications = await NotificationSchema.findAll({
          where: {
            sensorId: sensorData.sensorId,
          },
        });

        // Check each notification's condition
        for (const notification of notifications) {
          let shouldNotify = false;

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
            } else {
              throw new BadRequestError("Invalid notification platform");
            }
          }
        }
      },
    },
  }
);

SensorDataSchema.belongsTo(SensorSchema, { foreignKey: "sensorId" });

sequelize
  .sync()
  .then(() => {
    console.log("SensorData table created successfully");
  })
  .catch((error) => {
    console.log("Unable to created SensorData table: ", error);
  });

module.exports = SensorDataSchema;
