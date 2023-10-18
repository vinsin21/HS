const crypto = require('crypto')
const { StaffRoleEnum, LoginTypeEnum } = require("../constants");
const Doctor = require("../models/doctor.mdoel");
const HospitalId = require("../models/hospitalId.models");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/apiError");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendMail, forgotPasswordMailgenContent, emailVerificationMailgenContent } = require("../utils/mail");
const { doctorRegisterValidator } = require("../validators/doctor.validator");

const generateAccessAndRefreshToken = async (id) => {

    try {
        const doctor = await Doctor.findById(id)
        const accessToken = await doctor.generateAccessToken()
        const refreshToken = await doctor.generateRefreshToken()
        doctor.refreshToken = refreshToken;
        await doctor.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(404, "something went wrong generating access&refesh token")
    }

}

const doctorSignup = asyncHandler(async (req, res) => {
    const { username, email, password, role, hospitalId } = req.body;

    const doctorExist = await Doctor.findOne({ email });
    if (doctorExist) throw new ApiError(401, "doctor with this email already exist")
    //check hospitalId
    const hospitalIdExist = await HospitalId.findOne({ code: hospitalId })
    if (!hospitalIdExist) throw new ApiError(404, "invlaid  hospitalId")

    const doctor = await Doctor.create({
        username,
        email,
        password,
        hospitalId,
        role: role || StaffRoleEnum.DOCTOR,
        isVerified: false
    });
    const { unhashedToken, hashedToken, tokenExpiry } = await doctor.generateRandomToken()
    console.log
    doctor.emailVerificationToken = hashedToken;
    doctor.emailVerificationExpiry = tokenExpiry;
    await doctor.save({ validateBeforeSave: false })

    sendMail({
        email: doctor.email,
        subject: "doctor email verification ",
        mailgenContent: emailVerificationMailgenContent(
            doctor.username,
            `${req.protocol}://${req.get('host')}/api/v1/doctor/verify-email/${unhashedToken}`
        )
    })

    const registeredDoctor = await Doctor.findById(doctor._id).select("username email role loginType isVerified")

    if (!registeredDoctor) {
        throw new ApiError(404, "something went wrong while registering doctor")
    }

    return res.status(201).json(new ApiResponse(201, { doctor: registeredDoctor }, "admin registered and verification link is send to email"))


})

const verifyEmail = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    if (!resetToken) {
        throw new ApiError(404, "reset token is required")
    }

    const hash = crypto.createHash("sha256").update(resetToken).digest("hex")


    const doctor = await Doctor.findOne({
        emailVerificationToken: hash,
        emailVerificationExpiry: { $gt: Date.now() },
    })

    if (!doctor) {
        throw new ApiError(404, "token is inlviad or expired")
    }

    doctor.emailVerificationToken = undefined;
    doctor.emailVerificationExpiry = undefined;
    doctor.isVerified = true;
    await doctor.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "email verifed successfully"))

})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email })
    if (!doctor) throw new ApiError(404, "invalid email id ")

    if (doctor.loginType !== LoginTypeEnum.EMAIL_PASSWORD) {
        throw new ApiError(`you are registerd using ${doctor.loginType}  method plz login usnig the same ${doctor.loginType} method `)
    }

    const isPasswordCorrect = await doctor.isCorrectPassword(password);
    if (!isPasswordCorrect) {
        throw new ApiError(404, "inlvaid credentials plz check password and email")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(doctor._id)


    const logedinDoctor = await Doctor.findById(doctor._id).select("username email role")

    if (!logedinDoctor) {
        throw new ApiError(404, "somthing went wrong while logging in");
    }



    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }


    return res.status(200)
        .cookie("accessDoctorToken", accessToken, options)
        .cookie("refreshDoctorToken", refreshToken, options)
        .json(new ApiResponse(200, { doctor: logedinDoctor, accessToken, refreshToken }, "user login successfully"))
})

const forgotenPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    const doctor = await Doctor.findOne({ email })
    if (!doctor) throw new ApiError(404, "invlaid email ");

    const { unhashedToken, hashedToken, tokenExpiry } = await doctor.generateRandomToken()

    doctor.passwordResetToken = hashedToken;
    doctor.passwordResetExpiry = tokenExpiry;
    await doctor.save({ validateBeforeSave: false });


    //sendMail for
    sendMail({
        email: doctor.email,
        subject: "forgoten password reset verification link",
        mailgenContent: forgotPasswordMailgenContent(
            doctor.username,
            `${req.protocol}://${req.get('host')}/api/v1/doctor/verify-forgoten-password/${unhashedToken}`
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

    const doctor = await Doctor.findOne({
        passwordResetToken: hash,
        passwordResetExpiry: { $gt: Date.now() }
    })

    if (!doctor) {
        throw new ApiError(404, "reset token is  invalid or expired")
    }

    doctor.passwordResetExpiry = undefined;
    doctor.passwordResetToken = undefined;
    doctor.password = newPassword;
    await doctor.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "reset password set succesfully"))



})

const refreshToken = asyncHandler(async (req, res) => {
    const docRefreshToken = req.body?.refreshToken || req.query?.refreshToken;

    if (!docRefreshToken) throw new ApiError(404, "refresh token is required")

    const doctor = await Doctor.findOne({
        refreshToken: docRefreshToken
    })

    if (!doctor) throw new ApiError(404, "refreshToken is invalid or expired")

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(doctor._id);

    const updatedDoctor = await Doctor.findById(doctor._id).select("username email role isVerified")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res.status(200)
        .cookie("accessDoctorToken", accessToken, options)
        .cookie("refreshDoctorToken", refreshToken, options)
        .json(new ApiResponse(200, { doctor: updatedDoctor, accessToken, refreshToken }, "refresh access token successfully"))




})


const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const doctor = await Doctor.findById(req.doctor._id);
    if (!doctor) throw new ApiError("unAuthenticated")

    const isPasswordCorrect = await doctor.isCorrectPassword(oldPassword)
    if (!isPasswordCorrect) throw new ApiError(404, "invalid password or email");

    doctor.password = newPassword;
    doctor.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "password changed successfully"))

})

const logout = asyncHandler(async (req, res) => {

    const doctor = await Doctor.findByIdAndUpdate(
        req.doctor._id,
        {
            $set: { refreshToken: null }
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }
    return res.status(200)
        .clearCookie("accessDoctorToken", options)
        .clearCookie("refreshDoctorToken", options)
        .json(new ApiResponse(200, {}, " logout successfully"))

})

const currentDoctor = asyncHandler(async (req, res) => {

    const doctor = await Doctor.findById(req.doctor._id).select("username email role notAvailable")

    return res.status(200).json(new ApiResponse(200, { doctor }, "current user fetch "))

})


const addNotAvailabilty = asyncHandler(async (req, res) => {

    let { date, notAvailable } = req.body;
    notAvailable = notAvailable || true

    // const doctor = await Doctor.findByIdAndUpdate(
    //     req.doctor._id,
    //     {
    //         $push: { notAvailable: { date, notAvailable } }
    //     },
    //     { new: true }
    // )
    const doctor = await Doctor.findById(req.doctor._id);
    if (!doctor) {
        return res.status(404).json(new ApiResponse(404, null, "Doctor not found"));
    }

    const existingDateIndex = doctor.notAvailable.findIndex(
        (availability) => availability.date.toISOString() === new Date(date).toISOString()
    );

    if (existingDateIndex !== -1) {
        doctor.notAvailable[existingDateIndex].notAvailable = notAvailable;
    } else {
        doctor.notAvailable.push({ date, notAvailable });
    }

    await doctor.save();

    return res.status(200).json(new ApiResponse(
        200,
        {
            doctor
        },
        "not availabe date added successfully"
    ))

})

// This is when the doctor cancel his holiday and comming at work he change remove the date
const updateAvailability = asyncHandler(async (req, res) => {

    const { date, notAvailable } = req.body;

    const doctor = await Doctor.findById(req.doctor._id)
    if (!doctor) throw new ApiError(404, "doctor dont exist")

    const existingDateIndex = doctor.notAvailable.findIndex(
        (availability) => availability.date.toISOString() === new Date(date).toISOString())


    if (existingDateIndex !== -1) {
        doctor.notAvailable.splice(existingDateIndex, 1);
        await doctor.save({ validateBeforeSave: false })
        return res.status(200).json(new ApiResponse(200, { doctor }, "date removed successfully"))

    } else {
        return res.status(404).json(new ApiResponse(404, {}, `${date} not found in availability `))
    }

})

const getNotAvailabilityList = asyncHandler(async (req, res) => {

    const doctor = await Doctor.findById(req.doctor._id).select("notAvailable")

    if (!doctor) throw new ApiError(404, "doctor dont exist plz check id")

    return res.status(200).json(new ApiResponse(200, { doctor }, "list fetch successfully"))


})





module.exports = {
    doctorSignup,
    verifyEmail,
    login,
    forgotenPassword,
    forgotenPasswordVerification,
    refreshToken,
    changePassword,
    logout,
    currentDoctor,
    addNotAvailabilty,
    updateAvailability,
    getNotAvailabilityList
}