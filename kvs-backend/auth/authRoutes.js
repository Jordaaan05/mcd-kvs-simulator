const express = require('express')
const { login, register, authenticateToken } = require('./authController')

const router = express.Router()

router.post('/login', login)
router.post('/register', register)

module.exports = router