const jwt = require('jsonwebtoken')
const ApiError = require("../utils/apiError")
const { asyncHandler } = require("../utils/asyncHandler")
const Admin = require('../models/admin.models')
const Doctor = require('../models/doctor.mdoel')



const verifyAdminJwt = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessAdminToken || req.header("Authorization")

    if (!token) {
        throw new ApiError(401, "invlaid request unathenticated")
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY)
        const admin = await Admin.findById(decodedToken._id).select("username email role _id")

        if (!admin) {
            // in this case client should make a request to /refresh-token api to refresh the access token
            throw new ApiError("token is invalid or expired")
        }

        req.admin = admin
        return next()

    } catch (error) {
        throw new ApiError(403, "token is invalid or expired")
    }
})

const verifyDocJwt = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessDoctorToken || req.header("Authorization")

    if (!token) {
        throw new ApiError(401, "invlaid request unathenticated")
    }


    try {

        const decodedToken = jwt.verify(token, process.env.DOC_ACCESS_TOKEN_KEY)

        const doctor = await Doctor.findById(decodedToken._id).select("username email _id")

        if (!doctor) {
            // in this case client should make a request to /refresh-token api to refresh the access token
            throw new ApiError(404, "token is invalid or expired")
        }

        req.doctor = doctor
        return next()

    } catch (error) {
        throw new ApiError(403, "token is invalid or expired")
    }
})

const verfiyAdminPermission = (roles = []) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.admin?._id) {
            throw new ApiError(401, "soory canot go anyfuther")
        }
        if (roles.includes(req.admin.role)) {
            return next()
        } else {
            throw new ApiError(403, "you are not authorized to perform this operation")
        }
    })
}

module.exports = {
    verifyAdminJwt,
    verifyDocJwt,
    verfiyAdminPermission
}