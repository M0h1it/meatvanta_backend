const { failure } = require("../utils/apiResponse.util");
const multer = require("multer");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error("[errorHandler]", err);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Image must be 5MB or smaller." : "Image upload failed.";
    return failure(res, 422, message);
  }

  const statusCode = err.statusCode || 500;
  const message = err.expose ? err.message : "Something went wrong on our end.";

  return failure(res, statusCode, message);
}

module.exports = { errorHandler };
