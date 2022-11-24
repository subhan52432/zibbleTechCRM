const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = mongoose.Schema(
    {
        employeeName: {
            type: 'string',
            default: ''
        },
        email: {
            type: 'string',
            required: true,
            unique: true
        },
        cnic_passport: {
            type: 'string',
            default: ''
        },
        password: {
            type: 'string',
            required: true
        },
        dateOfJoining: {
            type: Date,
            default: ''
        },
        department: {
            type: 'string',
            default: ''
        },
        role: {
            type: 'string',
            default: ''
        },
        active: {
            type: Boolean,
            default: false
        },
        otp: {
            type: String
        },

        updatedAt: {
            type: Date,
            default: Date.now()
        },
        activeToken: String,
        activeExpires: Date,
    }
)


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

module.exports = mongoose.model('User', userSchema)
