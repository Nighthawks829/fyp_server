const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../db/connect");

const SensorSchema = require("./Sensors");

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
