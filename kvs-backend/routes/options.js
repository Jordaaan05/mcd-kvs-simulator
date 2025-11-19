const express = require('express')
const router = express.Router()
const optionsController = require('../controllers/optionsController')

router.get('/', optionsController.getAllOptions)

router.post('/', optionsController.createOption)

router.put('/:id', optionsController.modifyOption)

router.delete('/:id', optionsController.deleteOption)

module.exports = router