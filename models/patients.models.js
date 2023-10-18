const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
    },
    token: {
        type: String
    }
}, { timestamps: true })

const Appointment = mongoose.model("Appointment", appointmentSchema)

module.exports = Appointment
