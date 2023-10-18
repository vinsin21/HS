const { Router } = require('express')
const { doctorRegisterValidator, doctorLoginValidator, forgotenPasswordValidator, verifyForgotenPasswordValidatoar, refreshAccessTokenValidator, changePasswordValidator, AddNotAvailableValidator } = require('../validators/doctor.validator')
const validates = require('../validators/common/validates')
const { doctorSignup, verifyEmail, login, forgotenPassword, forgotenPasswordVerification, refreshToken, changePassword, logout, currentDoctor, addNotAvailabilty, updateAvailability, getNotAvailabilityList } = require('../controllers/doctor.controller')
const { verifyAdminJwt, verifyDocJwt } = require('../middlewares/auth.middleware')

const router = Router()

router.route("/signup").post(doctorRegisterValidator(), validates, doctorSignup)
router.route('/verify-email/:resetToken').get(verifyEmail)
router.route('/login').post(doctorLoginValidator(), validates, login)
router.route('/forgoten-password').post(forgotenPasswordValidator(), validates, forgotenPassword)
router.route("/verify-forgoten-password/:resetToken").post(verifyForgotenPasswordValidatoar(), validates, forgotenPasswordVerification)
router.route('/refresh-token').post(refreshAccessTokenValidator(), validates, refreshToken)


// secure routes
// authenticated routes
//change-password
router.route("/change-password").post(changePasswordValidator(), validates, verifyDocJwt, changePassword)
router.route("/logout").post(verifyDocJwt, logout)
router.route("/current-doctor").get(verifyDocJwt, currentDoctor)
router.route("/private").get(verifyDocJwt, (req, res) => { return res.send("private page") })
//add   notAvailable dates
router.route('/not-availabel').post(AddNotAvailableValidator(), validates, verifyDocJwt, addNotAvailabilty)
    .patch(AddNotAvailableValidator(), validates, verifyDocJwt, updateAvailability)
    .get(verifyDocJwt, getNotAvailabilityList)




module.exports = router