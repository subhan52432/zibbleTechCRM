const asyncHandler = require('express-async-handler')
const generateToken = require('../utils/generateToken.js')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const Otp = require('../models/otp')
const nodemailer = require('nodemailer')


// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
    console.log(req.body)

    const { employeeName, email, cnic_passport, password, dateOfJoining, department } = req.body
    const userExists = await User.findOne({ email })

    if (userExists) {
        return res.status(400).json({
            success: false,
            message: 'Entered email id already registered with us. Login to continue'
        })
    }


    const user = new User({
        employeeName,
        email,
        cnic_passport,
        password,
        dateOfJoining,
        department
    })


    // save user object
    user.save(function (err, user) {
        if (err) return next(err);
        res.status(201).json({
            success: true,
            message: 'Account Created Sucessfully. Please log in.'
        });
    });
})

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
        res.status(200).json({
            success: true,
            message: "Authorized User",
            employeeName: user.employeeName,
            email: user.email,
            cnic_passport: user.cnic_passport,
            dateOfJoining: user.dateOfJoining,
            department: user.department,
            role: user.role,
            active: user.active,
            token: generateToken(user._id),
        })
    } else {
        res.status(401).json({
            success: false,
            message: 'Unauthorized User'
        })
    }
})

// @desc    sending Email
// @route   POST /api/users/email-send
// @access  Public
const emailSend = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    const responseType = {}
    if (user) {
        const otpcode = Math.floor((Math.random() * 1000000) + 1)
        const otpData = new Otp({
            email: email,
            code: otpcode,
            expiresIn: new Date().getTime() + 300 * 1000
        })
        let otpResponse = await otpData.save()
        mailer(email, otpcode)
        responseType.statusText = 'Success'
        responseType.message = 'please check your Email Id'
    } else {
        responseType.statusText = 'error'
        responseType.message = 'Email Id Not Exist'
    }
    res.status(200).json(responseType)
    // mailer()
    // res.status(200).json({
    //     email : email
    // })

})

// @desc    validating token
// @route   POST /api/users/validate-token
// @access  Private
const validateToken = asyncHandler(async (req, res) => {
    const { email, code } = req.body
    const data = await Otp.findOne({ email, code })
    const response = {}
    if (data) {
        const currentTime = new Date().getTime()
        const diff = data.expiresIn - currentTime
        if (diff < 0) {
            response.statusText = 'error'
            response.message = 'Token Expire'
        } else {
            response.statusText = 'success'
            response.message = 'Token Validated'
        }
    } else {
        response.statusText = 'error'
        response.message = 'Invalid Otp'
    }
    res.status(200).json(response)
})

// @desc    validating token
// @route   POST /api/users/validate-token
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user) {
        user.password = password
        user.save(function (err, user) {
            if (err) {
                res.status(200).json({
                    statusType: 'error',
                    message: 'something went wrong'
                });
            }
            else {
                res.status(200).json({
                    statusType: 'success',
                    message: 'Password Updated Successfully, plz Login'
                });
            }

        });
    }
})

const mailer = (email, otpcode) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'zibbleweb@gmail.com',
            pass: 'nrllmavnsjiyziik'
        }
    })

    var mailOptions = {
        from: 'zibbleweb@gmail.com',
        to: 'zibbleweb@gmail.com',
        subject: 'Sending email using node js',
        text: `${otpcode}`
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
}

module.exports = {
    registerUser,
    authUser,
    emailSend,
    validateToken,
    changePassword
}