const mongoose = require('mongoose')
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2")
const hospitalIdSchmea = new mongoose.Schema({
    code: {
        type: String,
        unique: true
    }
}, { timestamps: true })


hospitalIdSchmea.plugin(mongooseAggregatePaginate)

const HospitalId = mongoose.model("HospitalId", hospitalIdSchmea)

module.exports = HospitalId