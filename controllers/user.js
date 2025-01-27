const { UserSchema } = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../errors");
const bcrypt = require("bcrypt");
const path = require("path");

const User = UserSchema;

/**
 * Create New User Controller
 * Handles user registration with optional image upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  let image = "";

  // Handle image upload if present in request
  if (req.files && req.files.image) {
    const file = req.files.image;
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = path.extname(file.name).toLowerCase();

    // Validate file type
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestError(
        "Invalid file type. Only image files are allowed"
      );
    }

    // Process valid image
    image = file.name;
    const uploadPath = `${__dirname}/../../client/public/uploads/${file.name}`;

    // Move file to upload directory
    file.mv(uploadPath, (error) => {
      if (error) {
        console.error(error);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: error });
      }
    });
  }

  // Create new user with hashed password (handled in User model hooks)
  const user = await User.create({
    name,
    email,
    password,   // Password is automatically hashed by model hook
    role,
    image
  });

  // Generate JWT for immediate authentication
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

/**
 * Get All Users Controller (Admin Only)
 * Retrieves list of all registered users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = async (req, res) => {
  // Fetch all users from database
  const users = await User.findAll();

  res.status(StatusCodes.OK).json({ users, count: users.length });
};

/**
 * Get Single User Controller
 * Retrieves user profile with authorization check
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUser = async (req, res) => {
  // Authorization check: Users can only view their own profile
  if (req.user.userId !== req.params.id && req.user.role === "user") {
    throw new ForbiddenError("No allow to get other user profile");
  }

  // Find user by primary key
  const user = await User.findByPk(req.params.id);

  // Return sanitized user data
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

/**
 * Update User Controller
 * This function handles the updating of user information.
 * It allows users to update their own profile and admins to update any user profile.
 */
const updateUser = async (req, res) => {
  // Destructure the request body, params, and user information
  const {
    body: { name, email, password, role },
    params: { id: userId },
    user: { userId: ownId }
  } = req;

  // Check if the user is trying to edit another user's profile and is not an admin
  if (req.user.userId !== req.params.id && req.user.role === "user") {
    throw new ForbiddenError("No allow to edit other user profile");
  }

  // Validate that all required fields are provided
  if (!name || !email || !password || !role) {
    throw new BadRequestError("Please provide all values");
  }

  // Find the user by their primary key (userId)
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError(`No user with id ${userId}`);
  }

  // Store the old user data for comparison later
  const oldData = {
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image
  };

  // Check if the provided password matches the current password
  const isPasswordSame = await bcrypt.compare(password, user.password);

  // Update the user's fields with the new data
  user.email = email;
  user.name = name;
  user.password = password;
  user.role = role;

  let image = "";

  // Handle image upload if an image file is provided
  if (req.files && req.files.image) {
    const file = req.files.image;

    // Define allowed file extensions for images
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestError(
        "Invalid file type. Only image files are allowed"
      );
    }

    image = file.name;

    // Define the path where the image will be saved
    const imagePath = `${__dirname}/../../client/public/uploads/${file.name}`;

    // Move the uploaded file to the specified path
    file.mv(imagePath, (error) => {
      if (error) {
        console.error(error);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: error });
      }
    });
    // Update the user's image field with the new image file name
    user.image = file.name;
  }

  // Save the updated user information to the database
  const respond = await user.save();

  // Check if the user is updating their own profile and if any data has changed
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
    // Generate a new JWT token for the updated user
    const token = user.generateJWT();

    // Clear the existing user cookie and set a new one with the updated token
    res.clearCookie("user");
    res.cookie("user", token, {
      httpOnly: true,
      secure: false, // Use secure cookies in production
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Respond with the updated user data and the new token
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
  // If an admin is updating another user's profile, respond with the updated user data
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

/**
 * Delete User Controller
 * This function handles the deletion of a user by their ID.
 */
const deleteUser = async (req, res) => {
  // Delete the user from the database using the provided user ID
  const user = await User.destroy({
    where: {
      id: req.params.id
    }
  });

  // If no user is found with the provided ID, throw a NotFoundError
  if (!user) {
    throw new NotFoundError(`No user with id ${req.params.id}`);
  }

  // Respond with a success message indicating the user was deleted
  res
    .status(StatusCodes.OK)
    .json({ msg: `Success delete user ${req.params.id}` });
};

module.exports = {
  addUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
};
