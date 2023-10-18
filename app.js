const express = require('express')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middlewares/error.middleware')

//API routes 
const adminRoutes = require("./routes/admin.routes")
const doctorRoutes = require("./routes/doctor.routes")
const patientRoutes = require("./routes/patients.routes")


const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())



app.get("/", (req, res) => {
    return res.send("home page")
})
//api endpoint
app.use("/api/v1/admin", adminRoutes)
app.use("/api/v1/doctor", doctorRoutes)
app.use("/api/v1/patient", patientRoutes)


app.use(errorHandler)

module.exports = app
