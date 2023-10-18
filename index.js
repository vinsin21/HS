const app = require("./app")
const dotenv = require('dotenv')
const connectDB = require("./db/connect")

dotenv.config({ path: "./.env" })

const majorNodeVersion = +process.env.NODE_VERSION?.split(".")[0]


const startServer = () => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at http://localhost:${process.env.PORT}`)
    })
}


if (majorNodeVersion >= 14) {
    //we can use asyncwait 
    (async () => {
        try {
            startServer()
            await connectDB()
        } catch (error) {
            console.log(`mongodb connection error`, error)
        }
    })()
} else {
    connectDB().then(() => {
        startServer()
    }).catch((err) => {
        console.log("mongodb connection error")
    })
}