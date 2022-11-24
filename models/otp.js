const mongoose = require('mongoose')

const otpSchema = mongoose.Schema(
    {
        email: String,
        code: String,
        expiresIn: Number
    },
    {
        timestamps:true
    }
)

module.exports = mongoose.model('Otp', otpSchema)