// Import required modules and dependencies
const { UserSchema } = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

// Initialize User model
const User = UserSchema;

/**
 * User Login Controller
 * Handles user authentication and session creation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  // Find user by email using Sequelize
  const user = await User.findOne({
    where: {
      email: email,
    },
  });


  // Check user existence
  if (!user) {
    throw new UnauthenticatedError("Invalid Email Address");
  }

  // Verify password using model method
  const isPasswordCorrect = await user.validPassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Password");
  }

  // Generate JWT token using model method
  const token = user.generateJWT();

  // Set authentication cookie with JWT token
  res.cookie("token", token, {
    // httpOnly: true,
    httpOnly: false,      // Should be true in production for XSS protection
    secure: false,        // Should be true in production (HTTPS only)
    sameSite: "strict",   // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days expiration
  });

  // Set user data cookie (consider security implications)
  res.cookie(
    "user",
    JSON.stringify({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    }),
    {
      httpOnly: false,    // Should be true if not needed client-side
      secure: false,       // Should match token cookie settings
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  );

  // Send response with user data and token
  res.status(StatusCodes.OK).json({
    user: {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    },
    token: token,
  });
};


/**
 * User Logout Controller
 * Handles session termination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = (req, res) => {
  // Clear authentication cookies
  res.clearCookie("user");
  res.clearCookie("token");

  // Send success response
  res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
};

module.exports = {
  login,
  logout,
};
