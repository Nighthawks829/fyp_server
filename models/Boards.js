const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../db/connect");

const BoardSchema = sequelize.define(
  "Boards",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 50],
          msg: "Board name should be between 2 and 50 characters",
        },
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 50],
          msg: "Board type should be between 2 and 50 characters",
        },
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: "Board location should be between 2 and 100 characters",
        },
      },
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: [
            "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
          ],
          msg: "Please provide a valid IP address",
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
      beforeUpdate: async (board) => {
        board.updatedAt = new Date();
      },
    },
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Boards table created successfully");
  })
  .catch((error) => {
    console.log("Unable to create Boards table: ", error);
  });

module.exports = BoardSchema;
