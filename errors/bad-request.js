// Import HTTP status codes for standardized status responses
const { StatusCodes } = require("http-status-codes");
// Import the base custom API error class
const CustomAPIError = require("./custom-api");

class BadRequestError extends CustomAPIError {
  constructor(message) {
    // Call the parent class (CustomAPIError) constructor with the provided message
    super(message);

    // Assign the HTTP 400 Bad Request status code
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

module.exports = BadRequestError;