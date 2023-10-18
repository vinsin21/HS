const Doctor = require("../models/doctor.mdoel");
const Appointment = require("../models/patients.models");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/apiError");
const { asyncHandler } = require("../utils/asyncHandler");

const bookAppointment = asyncHandler(async (req, res) => {
    const { username, age, phoneNumber, doctorId, date } = req.body;

    const appointmentExist = await Appointment.findOne({
        username,
        phoneNumber,
        date: new Date(date)
    })

    if (appointmentExist) throw new ApiError(400, "user appointment of this date is already booked")

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) throw new ApiError(404, "doctor with this id exist")


    const currentDate = new Date(date);
    // Generate Token for user and return him
    const maxTokenToday = await Appointment.findOne({
        date: { $gte: currentDate, $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) }
    }).sort({ token: -1 }).limit(1)

    let newToken = 1;
    if (maxTokenToday) {
        newToken = +maxTokenToday.token + 1
    }


    const patient = await Appointment.create({
        username,
        age,
        phoneNumber,
        date: date,
        doctor: doctorId,
        token: newToken,
    })


    return res.status(200).json(new ApiResponse(201, { patient }, "appointment book successfully and token genrated"))


})

module.exports = { bookAppointment }