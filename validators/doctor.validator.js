const { body, query } = require('express-validator')
const { availableStaffRole } = require('../constants')

const doctorRegisterValidator = () => {
    return [
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username is required")
            .toLowerCase()
            .escape(),
        body("email")
            .trim()
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("email is invalid")
            .toLowerCase()
            .escape(),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is reuqired")
            .escape()
            .isAlphanumeric()
            .withMessage("passowrd shoudl be alphanumberic")
            .isLength({ min: 8, max: 20 })
            .withMessage("password should be in between 8 to 20 characters"),
        body("hospitalId")
            .trim()
            .notEmpty()
            .withMessage("hospitalId is required plz ")
            .toUpperCase()
            .escape(),
        body("role")
            .trim()
            .notEmpty()
            .withMessage("role is required")
            .toUpperCase()
            .isIn(availableStaffRole)
            .withMessage("invalid Role")


    ]
}

const doctorLoginValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("email is invalid")
            .toLowerCase()
            .escape(),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is reuqired")
            .escape()
            .isAlphanumeric()
            .withMessage("passowrd shoudl be alphanumberic")
            .isLength({ min: 8, max: 20 })
            .withMessage("password should be in between 8 to 20 characters"),
    ]
}
const forgotenPasswordValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("email is invalid")
            .toLowerCase()
            .escape(),
    ]
}
const verifyForgotenPasswordValidatoar = () => {
    return [
        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("password is reuqired")
            .escape()
            .isAlphanumeric()
            .withMessage("passowrd shoudl be alphanumberic")
            .isLength({ min: 8, max: 20 })
            .withMessage("password should be in between 8 to 20 characters"),
    ]
}
const refreshAccessTokenValidator = () => {
    return [
        body("refreshToken")
            .optional()
            .trim()
            .isJWT()
            .withMessage("its not a jwt token")
            .escape(),
        query("refreshToken")
            .trim()
            .optional()
            .isJWT()
            .withMessage("its not a jwt token")
            .escape()
    ]
}

const changePasswordValidator = () => {
    return [
        body("oldPassword")
            .trim()
            .notEmpty()
            .withMessage("password is reuqired")
            .escape()
            .isAlphanumeric()
            .withMessage("passowrd shoudl be alphanumberic")
            .isLength({ min: 8, max: 20 })
            .withMessage("password should be in between 8 to 20 characters"),
        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("password is reuqired")
            .escape()
            .isAlphanumeric()
            .withMessage("passowrd shoudl be alphanumberic")
            .isLength({ min: 8, max: 20 })
            .withMessage("password should be in between 8 to 20 characters"),

    ]
}

const AddNotAvailableValidator = () => {

    return [
        body("date")
            .notEmpty()
            .withMessage("Date is required")
            .isDate()
            .withMessage("invlaid format date"),
        body("notAvailable")
            .optional()
            .isBoolean()
            .withMessage("it should be boolean")
    ]

}

// if we want to give the client-side the freedom to send date in any format we can use 
// moment.js
// const { body, validationResult } = require('express-validator');
// const moment = require('moment');

// const AddNotAvailableValidator = () => {
//   return [
//     body('date')
//       .notEmpty()
//       .withMessage('Date is required')
//       .custom((value) => {
//         // Attempt to parse date in multiple formats
//         const isoDate = moment(value, ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], true);
//         if (!isoDate.isValid()) {
//           throw new Error('Invalid date format. Supported formats are DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD.');
//         }
//         // Store the ISO 8601 formatted date for use in your route handler
//         request.isoDate = isoDate.toISOString();
//         return true;
//       }),
//     body('notAvailable')
//       .notEmpty()
//       .isBoolean()
//       .withMessage('It should be a boolean'),
//   ];
// };
// write this code in contorller 
// const { date, notAvailable } = req.body;

//   // Assuming 'date' is the date received from the client in any format
//   const isoDate = moment(date, 'your_format_here').toISOString();



module.exports = {
    doctorRegisterValidator,
    doctorLoginValidator,
    forgotenPasswordValidator,
    verifyForgotenPasswordValidatoar,
    refreshAccessTokenValidator,
    changePasswordValidator,
    AddNotAvailableValidator
}
