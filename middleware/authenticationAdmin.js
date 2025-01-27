const jwt = require("jsonwebtoken");    // Import JWT for token verification
const { UnauthenticatedError } = require("../errors");    // Import custom unauthenticated error class
require("dotenv").config();   // Load environment variables from .env file

// Middleware function to authenticate admin users
const authAdmin = async (req, res, next) => {
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

    // Attach the user details to the request object
    req.user = {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };

    // Check if the user has admin privileges
    if (payload.role !== "admin") {
      throw new UnauthenticatedError("Authentication Invalid");
    }

    next();   // Proceed to the next middleware or route handler
  } catch (error) {
    // Handle authentication failure
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

// Export the authAdmin middleware function for use in routes
module.exports = authAdmin;
