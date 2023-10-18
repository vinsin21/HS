const { body, query, } = require('express-validator')
const { availableStaffRole } = require('../constants')

const adminRegisterValidator = () => {
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

const adminLoginValidator = () => {
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

const addHospitalIdValidator = () => {
    // { this how data will come in req.body from frontend
    //     "hospitalIds": [
    //         { "hospitalId": "ID1" },
    //         { "hospitalId": "ID2" },
    //         { "hospitalId": "ID3" }
    //     ]
    // }
    return [
        body("hospitalIds")
            .isArray()
            .withMessage("hospitalId should be an array of objects conataining hospitalid")
            .notEmpty()
            .withMessage("hospitalId is empty")
            .custom((value) => {         // this value represent hospitalIds array from req.body
                if (!Array.isArray(value)) return true
                for (const item of value) {
                    //item should be a object
                    if (typeof item !== "object") return false
                    //item object must conatin field name code
                    if (!item.hasOwnProperty("code")) return false

                    const code = item.code;
                    if (typeof code !== "string" || code.trim() === "") return false

                    item.code = item.code.toUpperCase()
                    //  item.code = item.code.escape()
                }
                return true
            })
            .withMessage("hospitalIds custom validation fail")
    ]
}

module.exports = {
    adminRegisterValidator,
    adminLoginValidator,
    refreshAccessTokenValidator,
    forgotenPasswordValidator,
    verifyForgotenPasswordValidatoar,
    changePasswordValidator,
    addHospitalIdValidator,
}