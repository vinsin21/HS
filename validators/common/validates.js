const { validationResult } = require('express-validator');
const ApiError = require('../../utils/apiError');


// valdates middleware handle all the error which are caugth during valditon
const validates = (req, res, next) => {

    const error = validationResult(req)
    if (error.isEmpty()) {
        return next()
    }
    let extractedError = [];
    error.array().map((err) => {
        extractedError.push({ [err.path]: err.msg })
    })

    const validationError = new ApiError(400, "recived data is not valid ", extractedError)

    next(validationError)

}

module.exports = validates