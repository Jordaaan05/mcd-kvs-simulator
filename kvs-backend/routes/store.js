const express = require('express')
const router = express.Router()
const storeController = require('../controllers/storeController')

router.get('/', storeController.getCurrentStoreInfo)
router.get('/latest', storeController.getMostRecentStoreInfo)

router.post('/', storeController.insertCurrentStoreInfo)

module.exports = router