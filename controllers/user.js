const {
  BoardSchema,
  UserSchema,
  DashboardSchema,
  NotificationSchema,
  SensorControlsSchema
} = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../errors");
const bcrypt = require("bcrypt");

const User = UserSchema;
const addUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  let image = "";

  if (req.files && req.files.image) {
    const file = req.files.image;
    image = file.name;
    const uploadPath = `${__dirname}/../../client/public/uploads/${file.name}`;

    file.mv(uploadPath, (error) => {
      if (error) {
        console.error(error);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: error });
      }
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    image
  });

  const token = user.generateJWT();
  if (user) {
    res.status(StatusCodes.CREATED).json({
      user: {
        userId: user.id,
        name,
        email,
        role,
        image: user.image
      },
      token
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
  if (req.user.userId !== req.params.id && req.user.role === "user") {
    throw new ForbiddenError("No allow to get other user profile");
  }

  const user = await User.findByPk(req.params.id);

  if (user) {
    res.status(StatusCodes.OK).json({
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image
      }
    });
  } else {
    throw new NotFoundError(`No user with id ${req.params.id}`);
  }
};

// const updateUser = async (req, res) => {
//   const {
//     body: { name, email, password, role },
//     params: { id: userId },
//     user: { userId: ownId },
//   } = req;

//   let image = "";

//   if (!name || !email || !password || !role) {
//     throw new BadRequestError("Please provide all values");
//   }

//   const user = await User.findByPk(userId);

//   // Store the old data
//   const oldData = {
//     email: user.email,
//     name: user.name,
//     role: user.role,
//     image: user.image,
//   };

//   const isPasswordSame = await bcrypt.compare(password, user.password);

//   user.email = email;
//   user.name = name;
//   user.password = password;
//   user.role = role;
//   user.image = req.files.image.name;

//   const respond = await user.save();

//   // Check if the own user profile changed.
//   // Then update own user profile and generate new token
//   if (
//     ownId === userId &&
//     (JSON.stringify(oldData) !==
//       JSON.stringify({
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         image: user.image,
//       }) ||
//       !isPasswordSame)
//   ) {
//     const token = user.generateJWT();
//     res.clearCookie("jwt");
//     res.cookie("jwt", token, {
//       httpOnly: true,
//       secure: false, // Use secure cookies in production
//       sameSite: "strict",
//       maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//     });

//     res.status(StatusCodes.OK).json({
//       user: {
//         userId: userId,
//         email: email,
//         name: name,
//         password: password,
//         role: role,
//         image: image,
//       },
//       token: token,
//     });
//   }
//   // Admin update other user profile and did not generate new token
//   else {
//     if (req.files && req.files.image) {
//       const file = req.files.image;
//       image = file.name;
//       const uploadPath = `${__dirname}/../../client/public/uploads/${file.name}`;
//       file.mv(uploadPath, (error) => {
//         if (error) {
//           console.error(error);
//           return res
//             .status(StatusCodes.INTERNAL_SERVER_ERROR)
//             .json({ msg: error });
//         }
//       });
//     }

//     res.status(StatusCodes.OK).json({
//       user: {
//         userId: userId,
//         email: email,
//         name: name,
//         password: password,
//         role: role,
//         image: image,
//       },
//     });
//   }
// };

const updateUser = async (req, res) => {
  const {
    body: { name, email, password, role },
    params: { id: userId },
    user: { userId: ownId }
  } = req;

  if (!name || !email || !password || !role) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError(`No user with id ${userId}`);
  }

  // Store the old data
  const oldData = {
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image
  };

  const isPasswordSame = await bcrypt.compare(password, user.password);

  // Update user fields
  user.email = email;
  user.name = name;
  user.password = password;
  user.role = role;

  // Handle image upload
  if (req.files && req.files.image) {
    const file = req.files.image;
    const imagePath = `${__dirname}/../../client/public/uploads/${file.name}`;
    file.mv(imagePath, (error) => {
      if (error) {
        console.error(error);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: error });
      }
    });
    user.image = file.name;
  }

  const respond = await user.save();

  // Check if the own user profile changed.
  // Then update own user profile and generate new token
  if (
    ownId === userId &&
    (JSON.stringify(oldData) !==
      JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image
      }) ||
      !isPasswordSame)
  ) {
    const token = user.generateJWT();
    res.clearCookie("user");
    res.cookie("user", token, {
      httpOnly: true,
      secure: false, // Use secure cookies in production
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(StatusCodes.OK).json({
      user: {
        userId: userId,
        email: email,
        name: name,
        password: password,
        role: role,
        image: user.image
      },
      token: token
    });
  }
  // Admin update other user profile and did not generate new token
  else {
    res.status(StatusCodes.OK).json({
      user: {
        userId: userId,
        email: email,
        name: name,
        password: password,
        role: role,
        image: user.image
      }
    });
  }
};

const deleteUser = async (req, res) => {
  const user = await User.destroy({
    where: {
      id: req.params.id
    }
  });
  if (!user) {
    throw new NotFoundError(`No user with id ${req.params.id}`);
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: `Success delete user ${req.params.id}` });
};

const getUserWithBoards = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [
      {
        model: BoardSchema,
        as: "boards"
      }
    ]
  });

  if (user) {
    res.status(StatusCodes.OK).json({
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        boards: user.boards
      }
    });
  } else {
    throw new NotFoundError(`No user with id ${req.params.id}`);
  }
};

const getUserWithDashboards = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [
      {
        model: DashboardSchema,
        as: "dashboards"
      }
    ]
  });

  if (user) {
    res.status(StatusCodes.OK).json({
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        dashboards: user.dashboards
      }
    });
  } else {
    throw new NotFoundError(`No user with id ${req.params.id}`);
  }
};

const getUserWithNotifications = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [
      {
        model: NotificationSchema,
        as: "notifications"
      }
    ]
  });

  if (user) {
    res.status(StatusCodes.OK).json({
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        notifications: user.notifications
      }
    });
  } else {
    throw new NotFoundError(`No user with id ${req.params.id}`);
  }
};

const getUserWithSensorControls = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [
      {
        model: SensorControlsSchema,
        as: "sensorControls"
      }
    ]
  });

  if (user) {
    res.status(StatusCodes.OK).json({
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        sensorControls: user.sensorControls
      }
    });
  } else {
    throw new NotFoundError(`No user with id ${req.params.id}`);
  }
};

module.exports = {
  addUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
};
