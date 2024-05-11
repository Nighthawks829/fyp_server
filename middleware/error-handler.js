const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong try again later",
  };

  if (err.name === "Validation Error") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    customError.statusCode = 400;
  }

  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field please choose another value`;
    customError.statusCode = 400;
  }

  if (err.name === "CastError") {
    customError.msg = `No item found with id :${err.value}`;
    customError.statusCode = 404;
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    customError.msg = err.errors[0].message;
    customError.statusCode = 400;
  }

  if (
    err.name === "SequelizeDatabaseError" &&
    err.parent.code === "WARN_DATA_TRUNCATED"
  ) {
    const columnName = err.parent.sqlMessage.match(/'([^']+)'/)[1];
    customError.msg = `Invalid ${columnName} value. Please select the valid status`;
    customError.statusCode = 400;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;