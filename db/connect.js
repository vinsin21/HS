const mongoose = require("mongoose")
const { DB_NAME } = require("../constants")



let dbInastance = undefined
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)

        dbInastance = connectionInstance;
        console.log(`connected to mongodb DB host ${connectionInstance.connection.host}`)

    } catch (error) {
        console.log("Error at connectDB", error)
    }
}

module.exports = connectDB