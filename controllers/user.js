const User = require("../models/Users");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const bcrypt = require("bcrypt");

const addUser = async (req, res) => {
  const { name, email, password, role, image } = req.body;

  const user = await User.create({
    name: name,
    email: email,
    password: password,
    role: role,
    image: image,
  });

  const token = user.generateJWT();
  if (user) {
    res.status(StatusCodes.CREATED).json({
      user: {
        userId: user.id,
        name: name,
        email: email,
        password: password,
        role: role,
        image: user.image,
      },
      token,
    });
  } else {
    throw new BadRequestError("Unable to create new user. Try again later.");
  }
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
      image: user.image,
    });
  } else {
    throw new NotFoundError(`No user with id ${req.params.id}`);
  }
};

const updateUser = async (req, res) => {
  const {
    body: { name, email, password, role },
    params: { id: userId },
    user: { userId: ownId },
  } = req;

  if (!name || !email || !password || !role) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findByPk(userId);

  // Store the old data
  const oldData = {
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image,
  };

  const isPassswordSame = await bcrypt.compare(password, user.password);

  user.email = email;
  user.name = name;
  user.password = password;
  user.role = role;

  const respond = await user.save();

  console.log(ownId);
  console.log(userId);

  // Check if the own user profile changed.
  // Then update own user profile and generate new token
  if (
    ownId === userId &&
    (JSON.stringify(oldData) !==
      JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      }) ||
      !isPassswordSame)
  ) {
    const token = user.generateJWT();
    res.clearCookie("jwt");
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false, // Use secure cookies in production
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(StatusCodes.OK).json({
      user: {
        email: email,
        name: name,
        password: password,
        role: role,
      },
      token: token,
    });
  }
  // Admin update other user profile and did not generate new token
  else {
    res.status(StatusCodes.OK).json({
      user: {
        email: email,
        name: name,
        password: password,
        role: role,
      },
    });
  }
};

const deleteUser = async (req, res) => {
  const user = await User.destroy({
    where: {
      id: req.params.id,
    },
  });
  if (!user) {
    throw new NotFoundError(`No user with id ${req.params.id}`);
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: `Success delete user ${req.params.id}` });
};

module.exports = {
  addUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};
