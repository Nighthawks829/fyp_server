const { StatusCodes } = require("http-status-codes");

/**
 * Global Error Handling Middleware
 * 
 * Centralized error handler that processes different types of Sequelize errors
 * and normalizes error responses for API clients.
 */
const errorHandlerMiddleware = (err, req, res, next) => {
  // Default error response structure
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong try again later"
  };

  // console.log(err);

  // Handle unique constraint violations (e.g., duplicate entries)
  if (err.name === "SequelizeUniqueConstraintError") {
    customError.msg = err.errors[0].message;

    // Capitalize first letter of error message
    customError.msg =
      customError.msg.charAt(0).toUpperCase() + customError.msg.slice(1);

    // Custom messages for specific unique constraint violations
    if (customError.msg.slice(0, 10) === "Ip_address") {
      customError.msg = "IP address must be unique";
    }
    if (customError.msg.slice(0, 5) === "Email") {
      customError.msg = "Email address must be unique";
    }
    if (customError.msg.slice(0, 5) === "Topic") {
      customError.msg = "Sensor MQTT topic must be unique";
    }
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handle invalid data type errors (e.g., string instead of integer)
  if (
    err.name === "SequelizeDatabaseError" &&
    err.parent.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD"
  ) {
    const columnName = err.parent.sqlMessage.match(/'([^']+)'/)[1];
    customError.msg = "Incorrect integer value";
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handle invalid ENUM values
  if (
    err.name === "SequelizeDatabaseError" &&
    err.parent.code === "WARN_DATA_TRUNCATED"
  ) {
    const columnName = err.parent.sqlMessage.match(/'([^']+)'/)[1];
    customError.msg = `Invalid ${columnName} value. Please select the valid status`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handle model validation errors
  if (err.name === "SequelizeValidationError") {
    customError.msg = err.errors[0].message;
    if (customError.msg.slice(-4) === "null") {
      customError.msg = customError.msg.replace(/\./g, " ");
      // console.log(customError.msg);
    }
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handle foreign key constraint violations
  if (err.name === "SequelizeForeignKeyConstraintError") {
    customError.msg =
      "Cannot delete or update this record because it's referenced in other records.";

    // Context-specific messages based on affected relationships
    if (
      err.fields.includes("boardId") &&
      err.parent.sqlMessage.includes("delete")
    ) {
      customError.msg =
        "This board cannot be deleted because it has associated sensors.";
    }

    if (
      err.fields.includes("boardId") &&
      err.parent.sqlMessage.includes("add")
    ) {
      customError.msg =
        "This board cannot be add because it has foreign key constraint fails";
    }

    if (
      err.fields.includes("sensorId") &&
      err.parent.sqlMessage.includes("delete")
    ) {
      customError.msg =
        "This sensor cannot be deleted because it has associated records.";
    }

    if (
      err.fields.includes("sensorId") &&
      err.parent.sqlMessage.includes("add")
    ) {
      customError.msg =
        "This sensor cannot be add because it has foreign key constraint fails";
    }

    if (err.fields.includes("userId")) {
      customError.msg =
        "This user cannot be deleted because it has associated records.";
    }

    customError.statusCode = StatusCodes.BAD_REQUEST;
  }
  
  // Return standardized error response
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
