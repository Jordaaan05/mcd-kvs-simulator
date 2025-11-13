const { Order, Item, Category } = require('../database/database'); // Adjust the path as per your project structure
const { broadcastMessage } = require('../modules/websocket')
const { Op } = require('sequelize')

/*
  TODO:
  All more GET functions, to make the program more efficient, so that for example,
  when the KVS fetches orders, it does not fetch all those that are served when it is
  just trying to fetch a new order. Should also be so that the unneeded data isn't being
  requested from the DB to begin with.
*/

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

const getLastDTOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        location: 'DT'
      },
      include: [
        {
          model: Item,
          include: Category
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    if (order) {
      res.json(order)
    } else {
      res.status(404).json({ message: 'No orders found' })
    } 
  } catch (err) {
    console.error('Error fetching last order:', err);
    res.status(500).json({ error: 'Failed to fetch last order' });
  }
}

const getLastFCOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        location: 'FC'
      },
      include: [
        {
          model: Item,
          include: Category
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    if (order) {
      res.json(order)
    } else {
      res.status(404).json({ message: 'No orders found' })
    } 
  } catch (err) {
    console.error('Error fetching last order:', err);
    res.status(500).json({ error: 'Failed to fetch last order' });
  }
}

const fetchOrderByID = async (req, res) => {
  const { id } = req.params

  try {
    const order = await Order.findByPk(id, { 
      include: [
        {
          model: Item,
          include: Category
        }
      ]
     });
    if (order) {
      res.json(order)
    } else {
      res.status(404).json({ message: 'No orders found' })
    } 
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

const fetchServedOrderByBizDay = async (req, res) => {
  const { businessDay, stationName } = req.params

  try {
    let orders = await Order.findAll({
      include: [
        {
          model: Item,
          include: Category,
        },
      ],
      where: {
        businessDay: businessDay,
        served: {
          [Op.not]: null,
        }
      },
      order: [['createdAt', 'DESC']],
    });
    orders = orders.filter(order => {
      const served = order.served || {};
      return served[stationName] !== undefined && served[stationName] !== null;
    }); 

    if (orders.length > 0) {
      res.json(orders);
    } else {
      res.status(404).json({ message: 'No orders found' });
    }
  } catch (err) {
    console.error(`Error fetching orders:`, err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
}

const fetchOrderByBizDay = async (req, res) => {
  const { businessDay, stationName } = req.params

  try {
    let orders = await Order.findAll({
      include: [
        {
          model: Item,
          include: Category,
        },
      ],
      where: {
        businessDay: businessDay,
      },
      order: [['createdAt', 'DESC']],
    });
    orders = orders.filter(order => {
      return order.sendToKVS && order.sendToKVS.includes(stationName) &&
      (!order.served || !order.served[stationName]);
    }); 

    if (orders.length > 0) {
      res.json(orders);
    } else {
      res.status(404).json({ message: 'No orders found' });
    }
  } catch (err) {
    console.error(`Error fetching orders:`, err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
}

// Create a new order
const createOrder = async (req, res) => {
  const { orderNumber, location, items, status, mfySide, timestamp, FCSide, kvsToSendTo, registerNumber, orderLocation, eatInTakeOut, businessDay } = req.body;

  try {
    const newOrder = await Order.create({
      orderNumber,
      location,
      status,
      mfySide,
      timestamp,
      FCSide,
      sendToKVS: kvsToSendTo,
      registerNumber: registerNumber,
      orderLocation: orderLocation,
      eatInTakeOut: eatInTakeOut,
      businessDay: businessDay,
    });

    const groupedItems = items.reduce((acc, item) => {
      const itemAmount = parseInt(item.amount, 10)
      if (acc[item.name]) {
        acc[item.name].amount = (parseInt(acc[item.name].amount, 10) + itemAmount).toString()
      } else {
        acc[item.name] = { ...item, amount: itemAmount.toString() }
      }
      return acc;
    }, {});

    const itemPromises = Object.values(groupedItems).map(async (item) => {
      const dbItem = await Item.findOne({ where: {name: item.name } });
      if (dbItem) {
        await newOrder.addItem(dbItem, { through: { amount: item.amount } });
      }
    });
    await Promise.all(itemPromises)

    broadcastMessage({ type: "NEW_ORDER", data: [newOrder.id, kvsToSendTo] })

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
  deleteOrder,
  getLastDTOrder,
  getLastFCOrder,
  fetchOrderByID,
  fetchServedOrderByBizDay,
  fetchOrderByBizDay
};
