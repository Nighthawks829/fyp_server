// Import HTTP status codes for standardized status responses
const { StatusCodes } = require("http-status-codes");
// Import the base custom API error class
const CustomAPIError = require("./custom-api");

// Define a custom error class for handling unauthenticated access errors
class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    // Call the parent class (CustomAPIError) constructor with the provided message
    super(message);
    // Assign the HTTP 401 Unauthorized status code
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = UnauthenticatedError;