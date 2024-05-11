const User = require("../models/Users");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.validPassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const token = user.generateJWT();
  res.status(StatusCodes.OK).json({
    user: {
      userId: user.id,
      name: user.name,
      email: user.email,
      token: token,
      role: role,
    },
  });
};
