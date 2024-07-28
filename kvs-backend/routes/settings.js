const express = require('express')
const router = express.Router()
const settingsController = require('../controllers/settingsController')

// GET all settings
router.get('/', settingsController.getAllSettings)

// POST new setting
router.post('/', settingsController.createSetting)

// PUT update setting (by name or by ID)
router.put('/:id', settingsController.updateSettingFromID) // default so no sublink infront the ID
router.put('/name/:id', settingsController.updateSettingFromName)

module.exports = router