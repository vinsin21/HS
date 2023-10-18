const { default: mongoose } = require("mongoose");
const ApiError = require("../utils/apiError");

const errorHandler = async (err, req, res, next) => {
    // we dont want do do any change in the actual err so we store it in error
    let error = err;


    //
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500;
        const message = error.message || "something went wrong"

        error = new ApiError(statusCode, message, error?.errors || [], err.stack)
    }

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    }
    // TODO:
    //removeUnusedMulterImageFilesOnError(req);

    return res.status(error.statusCode).json(response);

}

module.exports = errorHandler