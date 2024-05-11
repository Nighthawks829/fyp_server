const User = require("../models/Users");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const addUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name: name,
    email: email,
    password: pasword,
    role: role,
  });

  const token = user.generateJWT();
  res.status(StatusCodes.CREATED).json({
    user: {
      name: name,
      email: email,
      role: role,
    },
    token,
  });
};

module.exports = {
  addUser,
};
