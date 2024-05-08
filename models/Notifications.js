const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../db/connect");

const UserSchema = require("./Users");
const SensorSchema = require("./Sensors");

const NotificationSchema = sequelize.define(
  "Notifications",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: "Notificatiions name should be between 2 and 100 characters",
        },
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
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
    condition: {
      type: DataTypes.ENUM,
      values: ["bigger", "lower", "equal"],
      allowNull: false,
    },
    platform: {
      type: DataTypes.ENUM,
      values: ["email", "telegram"],
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        args: [2, 5000],
        msg: "Address should be between 2 and 5000 characters",
      },
    },
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
    timestamps: false,
    freezeTableName: true,
  }
);

NotificationSchema.belongsTo(UserSchema, { foreignKey: "userId" });
NotificationSchema.belongsTo(SensorSchema, { foreignKey: "sensorId" });

sequelize
  .sync()
  .then(() => {
    console.log("Notifications table created successfully");
  })
  .catch((error) => {
    console.log("Unable to created Notifications table: ", error);
  });

module.exports = NotificationSchema;
