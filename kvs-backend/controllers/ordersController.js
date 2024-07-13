const { Order, Item, Category } = require('../database'); // Adjust the path as per your project structure

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ 
      include: [
        {
          model: Item,
          include: Category
        }
      ]
     });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Create a new order
const createOrder = async (req, res) => {
  const { orderNumber, location, items, status, mfySide, timestamp, FCSide, kvsToSendTo, registerNumber } = req.body;

  try {
    const newOrder = await Order.create({
      orderNumber,
      location,
      status,
      mfySide,
      timestamp,
      FCSide,
      sendToKVS: kvsToSendTo,
      registerNumber: registerNumber
    });

    const itemPromises = items.map(async (item) => {
      const dbItem = await Item.findOne({ where: {name: item.name } });
      if (dbItem) {
        await newOrder.addItem(dbItem, { through: { amount: item.amount } });
      }
    });
    await Promise.all(itemPromises)

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(400).json({ error: 'Failed to create order' });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, served } = req.body;

  try {
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    order.served = served;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(400).json({ error: 'Failed to update order' });
  }
};

// Delete an order
const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.destroy();

    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(400).json({ error: 'Failed to delete order' });
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder
};
