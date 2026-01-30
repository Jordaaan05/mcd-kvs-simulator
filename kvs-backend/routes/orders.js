const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

const { authenticateToken } = require("../auth/authController");

// GET all orders
router.get('/', authenticateToken, ordersController.getAllOrders);

// fetch orders by id
router.get('/:id', authenticateToken, ordersController.fetchOrderByID)

// fetch served orders newer than the business day
router.get('/day/:businessDay/station/:stationName', authenticateToken, ordersController.fetchServedOrderByBizDay)
router.get('/day/:businessDay/station/:stationName/new', authenticateToken, ordersController.fetchOrderByBizDay)

// GET last order (DT/FC)
router.get('/last/DT', authenticateToken, ordersController.getLastDTOrder)
router.get('/last/FC', authenticateToken, ordersController.getLastFCOrder)

// POST a new order
router.post('/', authenticateToken, ordersController.createOrder);

// PUT update order status
router.put('/:id', authenticateToken, ordersController.updateOrderStatus);

// DELETE an order
router.delete('/:id', authenticateToken, ordersController.deleteOrder);

module.exports = router;
