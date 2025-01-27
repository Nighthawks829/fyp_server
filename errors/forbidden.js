// Import HTTP status codes for standardized status responses
const { StatusCodes } = require("http-status-codes");
// Import the base custom API error class
const CustomAPIError = require("./custom-api");

// Define a custom error class for handling forbidden access errors
class ForbiddenError extends CustomAPIError {
  constructor(message) {
    // Call the parent class (CustomAPIError) constructor with the provided message
    super(message);

    // Assign the HTTP 403 Forbidden status code
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

module.exports = ForbiddenError;