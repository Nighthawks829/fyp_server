const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../db/connect");

const SensorSchema = sequelize.define(
  "Sensors",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    boardId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
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
    pin: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: {
          args: true,
          msg: "Please provide a valid pin number",
        },
      },
    },
    type: {
      type: DataTypes.ENUM,
      values: [
        "Digital Input",
        "Digital Output",
        "Analog Input",
        "Analog Output",
      ],
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: "Topic length should be between 2 and 100 characters",
        },
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
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
    hooks: {
      beforeUpdate: async (sensor) => {
        sensor.updatedAt = new Date();
      },
    },
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Sensors table created successfully");
  })
  .catch((error) => {
    console.log("Unable to created Sensors table: ", error);
  });

module.exports = SensorSchema;
