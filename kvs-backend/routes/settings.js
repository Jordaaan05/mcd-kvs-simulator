const express = require('express')
const router = express.Router()
const settingsController = require('../controllers/settingsController')

const { authenticateToken } = require("../auth/authController")

// GET all settings
router.get('/', authenticateToken, settingsController.getAllSettings)

// POST new setting
router.post('/', authenticateToken, settingsController.createSetting)

// PUT update setting (by name or by ID)
router.put('/:id', authenticateToken, settingsController.updateSettingFromID) // default so no sublink infront the ID
router.put('/name/:name', authenticateToken, settingsController.updateSettingFromName)

module.exports = router