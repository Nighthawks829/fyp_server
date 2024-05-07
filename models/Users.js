const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../db/connect");

const UserSchema = sequelize.define(
  "Users",
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
          args: [2, 50],
          msg: "User name should be between 2 and 50 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: "Please provide a valid email",
        },
      },
    },
    passowrd: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: "Password length should be between 2 and 100 characters",
        },
      },
    },
    role: {
      type: DataTypes.ENUM,
      values: ["admin", "user"],
      allowNull: false,
      defaultValue: "user",
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
    updateAt: {
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

sequelize
  .sync()
  .then(() => {
    console.log("Users table created successfully");
  })
  .catch((error) => {
    console.log("Unable to create Users table: ", error);
  });

module.exports = UserSchema
