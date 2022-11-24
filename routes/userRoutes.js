const express = require('express');
const router = express.Router()
const {
  registerUser,
  authUser,
  emailSend,
  validateToken,
  changePassword
} = require('../controllers/userController')

const protect = require('../middleware/authMiddleware')

router.route('/').post(registerUser)
router.route('/login').post(authUser)
router.route('/email-send').post(emailSend)
router.route('/validate-token').post(validateToken)
router.route('/change-password').post(changePassword)


module.exports = router