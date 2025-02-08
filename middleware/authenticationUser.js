// Import JWT for token verification
const jwt = require("jsonwebtoken");
// Import custom unauthenticated error class
const { UnauthenticatedError } = require("../errors");
// Load environment variables from .env file
require("dotenv").config();

// Middleware function to authenticate users
const authUser = async (req, res, next) => {
  // Get authorization header from request
  const authHeader = req.headers.authorization;

  // Check if authorization header is missing or does not start with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatedError("Authentication Invalid");
  }

  // Extract token from the header
  const token = authHeader.split(" ")[1];
  try {
    // Verify JWT token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the other routes
    req.user = {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };

    next();   // Proceed to the next middleware or route handler
  } catch (error) {
    // Handle authentication failure
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

// Export the authUser middleware function for use in routes
module.exports = authUser;
