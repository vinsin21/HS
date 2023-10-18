const { Router } = require("express");
const { bookAppointment } = require("../controllers/patients.controller");
const { bookingAppointmentValidator } = require("../validators/patients.validator");
const validates = require("../validators/common/validates");

const router = Router()


//bookAppointment
router.route("/booking-appointment").post(bookAppointment)
//booking status // 



module.exports = router

