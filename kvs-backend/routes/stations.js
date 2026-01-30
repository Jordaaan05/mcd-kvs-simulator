const express = require('express')
const router = express.Router()
const stationController = require('../controllers/stationController')

const { authenticateToken } = require("../auth/authController")

router.get('/', authenticateToken, stationController.getAllStations)

router.get('/name/:name', authenticateToken, stationController.getStationByName)

router.post('/', authenticateToken, stationController.createStation)

router.put('/:id', authenticateToken, stationController.updateStationStatus)

module.exports = router