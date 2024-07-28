const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

// GET all orders
router.get('/', ordersController.getAllOrders);

// fetch orders by id
router.get('/:id', ordersController.fetchOrderByID)

// GET last order (DT/FC)
router.get('/last/DT', ordersController.getLastDTOrder)
router.get('/last/FC', ordersController.getLastFCOrder)

// POST a new order
router.post('/', ordersController.createOrder);

// PUT update order status
router.put('/:id', ordersController.updateOrderStatus);

// DELETE an order
router.delete('/:id', ordersController.deleteOrder);

module.exports = router;
