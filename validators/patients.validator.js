const { body } = require('express-validator')

const bookingAppointmentValidator = () => {
    return [
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username is required")
            .escape()
            .isLength({ min: 2 })
            .withMessage("username should be atleat 2 character long")
            .escape(),
        body("phoneNumber")
            .trim()
            .isNumeric()
            .matches(/^[0-9()-]+$/)
            .withMessage("invlaid phoneNumber check format ")
            .isLength({ min: 10 })
            .withMessage("phoneNumber should be atleast 10 digit long")
            .escape(),
        body("age")
            .trim()
            .notEmpty()
            .withMessage("age is required")
            .isInt()
            .withMessage("age should be a int value")
            .isLength({ min: 1, max: 120 })
            .withMessage("invalid age [1-120] limit")
            .escape(),
        body("doctorId")
            .trim()
            .notEmpty()
            .withMessage("doctorId is required")
            .isMongoId()
            .withMessage("invlaid doctorId")
            .escape(),
        body("date")
            .notEmpty()
            .withMessage("Date is required")
            .escape(),



    ]
}

module.exports = {
    bookingAppointmentValidator
}