const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../db/connect");

const SensorSchema = require("./Sensors");
const UserSchema = require("./Users");

const SensorControlsSchema = sequelize.define(
  "SensorControls",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    value: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isNumeric: {
          args: true,
          msg: "Sensor value should be numeric",
        },
      },
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

SensorControlsSchema.belongsTo(UserSchema, { foreignKey: "userId" });
SensorControlsSchema.belongsTo(SensorSchema, { foreignKey: "sensorId" });

sequelize
  .sync()
  .then(() => {
    console.log("SensorControls table created successfully");
  })
  .catch((error) => {
    console.log("Unable to created SensorControls table: ", error);
  });

module.exports = SensorControlsSchema;
