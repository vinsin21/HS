const { Router } = require('express')
const { adminRegisterValidator, adminLoginValidator, refreshAccessTokenValidator, forgotenPasswordValidator, verifyForgotenPasswordValidatoar, changePasswordValidator, addHospitalIdValidator } = require('../validators/admin.validator')
const validates = require('../validators/common/validates')
const { adminSignup, verifyEmail, login, refreshAccessToken, forgotenPassword, forgotenPasswordVerification, changePassword, logout, currentAdmin, getAllHospitalId, addHospitalId, getAlldoctors } = require('../controllers/admin.controller')
const { verifyAdminJwt, verfiyAdminPermission } = require('../middlewares/auth.middleware')
const { StaffRoleEnum } = require('../constants')

const router = Router()


router.route("/signup").post(adminRegisterValidator(), validates, adminSignup)
router.route("/verify-token/:resetToken").get(verifyEmail)
router.route("/login").post(adminLoginValidator(), validates, login)
router.route("/refresh-token").post(refreshAccessTokenValidator(), validates, refreshAccessToken)
router.route("/forgoten-password").post(forgotenPasswordValidator(), validates, forgotenPassword)
router.route("/verify-forgoten-password/:resetToken").post(verifyForgotenPasswordValidatoar(), validates, forgotenPasswordVerification)

// authenticated routes
//change-password
router.route("/change-password").post(changePasswordValidator(), validates, verifyAdminJwt, changePassword)
router.route("/logout").post(verifyAdminJwt, logout)
router.route("/current-admin").get(verifyAdminJwt, currentAdmin)
router.route("/private").get(verifyAdminJwt, (req, res) => { return res.send("private page") })
//addHospitalId
router.route("/hospital-id").get(verifyAdminJwt, verfiyAdminPermission(StaffRoleEnum.SUPER_ADMIN), getAllHospitalId)
    .post(addHospitalIdValidator(), validates, verifyAdminJwt, verfiyAdminPermission(StaffRoleEnum.SUPER_ADMIN), addHospitalId)
//gerAllDoctors 
router.route('/doctor').get(verifyAdminJwt, verfiyAdminPermission(StaffRoleEnum.SUPER_ADMIN), getAlldoctors)

//gerALL patients
module.exports = router
