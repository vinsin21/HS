const DB_NAME = "HS_BOOKING"

const StaffRoleEnum = {
    DOCTOR: "DOCTOR",
    ADMIN: "ADMIN",
    SUPER_ADMIN: "SUPER_ADMIN"
}

const availableStaffRole = Object.values(StaffRoleEnum)

const LoginTypeEnum = {
    EMAIL_PASSWORD: "EMAIL_PASSWORD",
    GOOGLE: "GOOGLE",
}

const availableLoginTypes = Object.values(LoginTypeEnum)

const RandomTokenExpiryTime = 1000 * 60 * 20

module.exports = {
    DB_NAME,
    StaffRoleEnum,
    availableStaffRole,
    LoginTypeEnum,
    availableLoginTypes,
    RandomTokenExpiryTime

}