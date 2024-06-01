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
    throw new UnauthenticatedError("Invalid Email Address");
  }

  const isPasswordCorrect = await user.validPassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Password");
  }

  const token = user.generateJWT();
  
  res.cookie("token", token, {
    // httpOnly: true,
    httpOnly: false,
    secure: false, // Use secure cookies in production
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.cookie(
    "user",
    JSON.stringify({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }),
    {
      httpOnly: false,
      secure: false, // Use secure cookies in production
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  );

  res.status(StatusCodes.OK).json({
    user: {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: token,
  });
};

const logout = (req, res) => {
  res.clearCookie("user");
  res.clearCookie("token");

  res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
};

module.exports = {
  login,
  logout,
};
