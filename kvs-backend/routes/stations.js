const express = require('express')
const router = express.Router()
const stationController = require('../controllers/stationController')

router.get('/', stationController.getAllStations)

router.post('/', stationController.createStation)

router.put('/:id', stationController.updateStationStatus)

module.exports = router