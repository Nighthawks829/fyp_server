// Import all custom error classes
const CustomAPIError = require("./custom-api");
const UnauthenticatedError = require("./unauthenticated");
const NotFoundError = require("./not-found");
const BadRequestError = require("./bad-request");
const ForbiddenError = require("./forbidden");

// Export all custom error classes as a module
module.exports = {
  CustomAPIError,
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
  ForbiddenError,
};
