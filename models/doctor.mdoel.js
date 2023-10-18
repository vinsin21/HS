const mongoose = require('mongoose')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2")
const { availableLoginTypes, LoginTypeEnum, StaffRoleEnum, availableStaffRole, RandomTokenExpiryTime } = require('../constants')


const doctorAvailability = new mongoose.Schema({
    date: {
        type: Date,
        unique: true
    },
    notAvailable: {
        type: Boolean,
        default: true,
    }
})


const doctorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    hospitalId: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: availableStaffRole,
        default: StaffRoleEnum.DOCTOR
    },
    notAvailable: {
        type: [doctorAvailability],

    },
    loginType: {
        type: String,
        enum: availableLoginTypes,
        default: LoginTypeEnum.EMAIL_PASSWORD
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationExpiry: {
        type: Date,
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpiry: {
        type: Date
    }

}, { timestamps: true })


doctorSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    try {

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword;
        next()

    } catch (error) {
        return next(error)
    }
})

doctorSchema.methods.isCorrectPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

doctorSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        role: this.role
    }, process.env.DOC_ACCESS_TOKEN_KEY,
        { expiresIn: process.env.DOC_ACCESS_TOKEN_EXPIRY })
}
doctorSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.DOC_REFRESH_TOKEN_KEY,
        { expiresIn: process.env.DOC_REFRESH_TOKEN_EXPIRY })
}

doctorSchema.methods.generateRandomToken = function () {
    const unhashedToken = crypto.randomBytes(10).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex")
    const tokenExpiry = Date.now() + RandomTokenExpiryTime
    return { unhashedToken, hashedToken, tokenExpiry }
}


doctorSchema.plugin(mongooseAggregatePaginate)

const Doctor = mongoose.model("Doctor", doctorSchema)

module.exports = Doctor