const User = require("../models/Users");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");
const { use } = require("express/lib/router");

const addUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name: name,
    email: email,
    password: password,
    role: role,
  });

  const token = user.generateJWT();
  res.status(StatusCodes.CREATED).json({
    user: {
      name: name,
      email: email,
      password: password,
      role: role,
    },
    token,
  });
};

const getAllUsers = async (req, res) => {
  const users = await User.findAll();

  res.status(StatusCodes.OK).json({ users, count: users.length });
};

const getUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (user) {
    res.status(StatusCodes.OK).json({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    throw new NotFoundError(`No user with id ${req.params.id}`);
  }
};

module.exports = {
  addUser,
  getAllUsers,
  getUser,
};
