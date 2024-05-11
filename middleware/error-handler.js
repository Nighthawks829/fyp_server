const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong try again later",
  };

  // console.log(err);

  // This block catches a 'SequelizeUniqueConstraintError' which occurs when a
  // unique constraint is violated in Sequelize.
  if (err.name === "SequelizeUniqueConstraintError") {
    customError.msg = err.errors[0].message;
    customError.msg =
      customError.msg.charAt(0).toUpperCase() + customError.msg.slice(1);
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // This block catches a 'SequelizeDatabaseError' with a 'WARN_DATA_TRUNCATED' code,
  // which occurs when an attempt is made to insert a value that is not in the enum list
  // of allowed values for a particular column.
  if (
    err.name === "SequelizeDatabaseError" &&
    err.parent.code === "WARN_DATA_TRUNCATED"
  ) {
    const columnName = err.parent.sqlMessage.match(/'([^']+)'/)[1];
    customError.msg = `Invalid ${columnName} value. Please select the valid status`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // This block catches a 'SequelizeValidationError', which occurs when the data
  // validation defined in the Sequelize model fails.
  if (err.name === "SequelizeValidationError") {
    customError.msg = err.errors[0].message;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
