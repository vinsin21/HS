const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/public/reports")
    },
    filename: function (req, file, cb) {

        const fileExtenion = ""

        if (file.originalname.split(".").length > 1) {
            file.originalname.substring(file.originalname.lastIndexOf("."))
        }

        const fileNameWithoutExtension = file.originalname.toLowerCase().split(" ").join("-").split(".")[0]

        cb(null, fileNameWithoutExtension + Date.now() + Math.ceil(Math.random() * 1e5) + fileExtenion)
    }
})

const upload = multer({
    storage
})

module.exports = upload