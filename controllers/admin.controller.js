const crypto = require('crypto')
const { StaffRoleEnum, LoginTypeEnum } = require("../constants");
const Admin = require("../models/admin.models");
const HospitalId = require("../models/hospitalId.models");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/apiError");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendMail, emailVerificationMailgenContent, forgotPasswordMailgenContent } = require("../utils/mail");
const { mongooseAggregatePaginationOptions } = require('../utils/helper');
const Doctor = require('../models/doctor.mdoel');

const generateAccessAndRefreshToken = async (id) => {

    try {
        const admin = await Admin.findById(id)
        const accessToken = await admin.generateAccessToken()
        const refreshToken = await admin.generateRefreshToken()
        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(404, "something went wrong generating access&refesh token")
    }

}

const adminSignup = asyncHandler(async (req, res) => {
    const { username, email, password, role, hospitalId } = req.body;

    const adminExist = await Admin.findOne({ email });
    if (adminExist) throw new ApiError(401, "admin with this email already exist")
    //check hospitalId
    const hospitalIdExist = await HospitalId.findOne({ code: hospitalId })
    if (!hospitalIdExist) throw new ApiError(404, "invlaid  hospitalId")

    const admin = await Admin.create({
        username,
        email,
        password,
        hospitalId,
        role: role || StaffRoleEnum.ADMIN,
        isVerified: false
    });
    const { unhashedToken, hashedToken, tokenExpiry } = await admin.generateRandomToken()
    admin.emailVerificationToken = hashedToken;
    admin.emailVerificationExpiry = tokenExpiry;
    await admin.save({ validateBeforeSave: false })

    sendMail({
        email: admin.email,
        subject: "admin email verification",
        mailgenContent: emailVerificationMailgenContent(
            admin.username,
            `${req.protocol}://${req.get('host')}/api/v1/admin/verify-token/${unhashedToken}`
        )
    })

    const registeredAdmin = await Admin.findById(admin._id).select("username email role loginType isVerified")

    if (!registeredAdmin) {
        throw new ApiError(404, "something went wrong while registering user")
    }

    return res.status(201).json(new ApiResponse(201, { admin: registeredAdmin }, "admin registered and verification link is send to email"))


})

const verifyEmail = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    if (!resetToken) {
        throw new ApiError(404, "reset token is required")
    }

    const hash = crypto.createHash("sha256").update(resetToken).digest("hex")


    const admin = await Admin.findOne({
        emailVerificationToken: hash,
        emailVerificationExpiry: { $gt: Date.now() },
    })

    if (!admin) {
        throw new ApiError(404, "token is inlviad or expired")
    }

    admin.emailVerificationToken = undefined;
    admin.emailVerificationExpiry = undefined;
    admin.isVerified = true;
    await admin.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "email verifed successfully"))

})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email })
    if (!admin) throw new ApiError(404, "invalid email id ")

    if (admin.loginType !== LoginTypeEnum.EMAIL_PASSWORD) {
        throw new ApiError(`you are registerd using ${admin.loginType}  method plz login usnig the same ${admin.loginType} method `)
    }

    const isPasswordCorrect = await admin.isCorrectPassword(password);
    if (!isPasswordCorrect) {
        throw new ApiError(404, "inlvaid credentials plz check password and email")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(admin._id)


    const logedinAdmin = await Admin.findById(admin._id).select("username email role")

    if (!logedinAdmin) {
        throw new ApiError(404, "somthing went wrong while logging in");
    }



    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }


    return res.status(200)
        .cookie("accessAdminToken", accessToken, options)
        .cookie("refreshAdminToken", refreshToken, options)
        .json(new ApiResponse(200, { admin: logedinAdmin, accessToken, refreshToken }, "user login successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const adminRefreshToken = req.body.refreshToken || req.query.refreshToken;

    if (!adminRefreshToken) {
        throw new ApiError(404, "adminRefreshToken is missing");
    }

    const admin = await Admin.findOne({ refreshToken: adminRefreshToken });

    if (!admin) {
        throw new ApiError(404, "refreshToken expired or already used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(admin._id)

    const updatedAdmin = await Admin.findById(admin._id).select("username email role")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }

    return res.status(200)
        .cookie("accessAdminToken", accessToken, options)
        .cookie("refreshAdminTokne", refreshToken, options)
        .json(new ApiResponse(200, { admin: updatedAdmin, accessToken, refreshToken }, "access token refresh successfully"))


})

const forgotenPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    const admin = await Admin.findOne({ email })
    if (!admin) throw new ApiError(404, "invlaid email ");

    if (!admin.isVerified) {
        throw new ApiError(401, "you account is not verified plz verify")
    }

    const { unhashedToken, hashedToken, tokenExpiry } = await admin.generateRandomToken()

    admin.passwordResetToken = hashedToken;
    admin.passwordResetExpiry = tokenExpiry;
    await admin.save({ validateBeforeSave: true });

    //sendMail for

    sendMail({
        email: admin.email,
        subject: "forgoten password reset verification link",
        mailgenContent: forgotPasswordMailgenContent(
            admin.username,
            `${req.protocol}://${req.get('host')}/api/v1/admin/verify-forgoten-password/${unhashedToken}`
        )
        // ! NOTE: Following link should be the link of the frontend page responsible to request password reset
        // ! Frontend will send the below token with the new password in the request body to the backend reset password endpoint
        // * Ideally take the url from the .env file which should be teh url of the frontend
    })

    return res.status(200).json(new ApiResponse(200, {}, "password reset verification link is send to you Email Id"))

})

const forgotenPasswordVerification = asyncHandler(async (req, res) => {
    const { newPassword } = req.body
    const { resetToken } = req.params

    if (!resetToken) {
        throw new ApiError(404, "reset token not found")
    }

    const hash = crypto.createHash("sha256").update(resetToken).digest("hex")

    const admin = await Admin.findOne({
        passwordResetToken: hash,
        passwordResetExpiry: { $gt: Date.now() }
    })

    if (!admin) {
        throw new ApiError(404, "reset token is  invalid or expired")
    }

    admin.passwordResetExpiry = undefined;
    admin.passwordResetToken = undefined;
    admin.password = newPassword;
    await admin.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "reset password set succesfully"))



})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id)

    if (!admin) throw new ApiError(404, "admin dont exist");

    const isPasswordCorrect = await admin.isCorrectPassword(oldPassword);

    if (!isPasswordCorrect) throw new ApiError(404, "wrong password");

    admin.password = newPassword;
    await admin.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "password changed successfully"))


})

const logout = asyncHandler(async (req, res) => {


    const admin = await Admin.findByIdAndUpdate(
        req.admin._id,
        {
            // $set: { refreshToken:  undefined } // its dont work the value dont change 
            // $set: { refreshToken: null }   // set the value to null 
            $unset: { refreshToken: 1 }    // it will remove the field
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res.status(200)
        .clearCookie("accessAdminToken", options)
        .clearCookie("refreshAdminToken", options)
        .json(new ApiResponse(200, { admin }, "logut successfully"))
})

const currentAdmin = asyncHandler(async (req, res) => {

    return res.status(200).json(new ApiResponse(200, { admin: req.admin }, "current admin fetch successfully"))
})

const getAllHospitalId = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10 } = req.query;


    const hospitalIdsAggregate = await HospitalId.aggregate([{ $match: {} }])

    const hospitalIds = await HospitalId.aggregatePaginate(
        hospitalIdsAggregate,
        mongooseAggregatePaginationOptions({
            page,
            limit,
            customLabels: {
                docs: "HospitalId_List",
                totalDocs: "Total HospitalIds"
            }
        })

    )
    return res.status(200).json(new ApiResponse(200, hospitalIds, "all hospitalIds are fetched"))

})

const addHospitalId = asyncHandler(async (req, res) => {

    const { hospitalIds } = req.body
    console.log(hospitalIds)

    const hospital_Ids = await HospitalId.create(hospitalIds)

    return res.status(200).json(new ApiResponse(200, { hospital_Ids }, "hospital id added successfully"))
})

const getAlldoctors = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10 } = req.query
    const doctorAggregate = await Doctor.aggregate([{ $match: {} }])

    const doctors = await Doctor.aggregatePaginate(
        doctorAggregate,
        mongooseAggregatePaginationOptions({
            page,
            limit,
            customLabels: {
                doc: "Doctors_List",
                totalDocs: "Total_Doctors"
            }
        })
    )

    return res.status(200).json(new ApiResponse(200, doctors, "all doctos fetch successfully"))


})

module.exports = {
    adminSignup,
    verifyEmail,
    login,
    refreshAccessToken,
    forgotenPassword,
    forgotenPasswordVerification,
    changePassword,
    logout,
    currentAdmin,
    getAllHospitalId,
    addHospitalId,
    getAlldoctors
}