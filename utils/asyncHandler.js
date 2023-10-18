const asyncHandler = (handler) => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(err => next(err))
    }
}

const asyncHandler2 = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next)
        } catch (error) {
            return next(error)
        }
    }
}


module.exports = {
    asyncHandler,
    asyncHandler2
}