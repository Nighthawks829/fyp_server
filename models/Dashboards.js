const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../db/connect");

const SensorSchema = require("./Sensors");

const DashboardSchema = sequelize.define(
  "Dashboards",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sensorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: {
          args: [2, 100],
          msg: "Dashboard component name should be between 2 and 100 characters",
        },
      },
    },
    control: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM,
      values: ["widget", "graph"],
      allowNull: false,
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

DashboardSchema.belongsTo(SensorSchema, { foreignKey: "sensorId" });

sequelize
  .sync()
  .then(() => {
    console.log("Dashboards table created successfully");
  })
  .catch((error) => {
    console.log("Unable to created Dashboards table: ", error);
  });

module.exports = DashboardSchema;
