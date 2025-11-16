/* 
    Fetches the required order information for the order router from the DB
*/

const { Order, Item, Category } = require('../../models/database')

const fetchOrders = async (stationName) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: Item,
                    include: Category
                }
            ]
        })
        const filteredOrders = orders.filter(order => !order.served?.[stationName]).filter(order => order.sendToKVS?.includes(stationName))
        return filteredOrders
    } catch (err) {
        console.error('Error fetching orders:', err)
    }
}

const fetchLastDTOrder = async () => {
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
          return order
        }
      } catch (err) {
        console.error('Error fetching last order:', err);
      }
}

const fetchLastFCOrder = async () => {
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
          return order
        } 
      } catch (err) {
        console.error('Error fetching last order:', err);
      }
}

module.exports = {
  fetchLastDTOrder,
  fetchLastFCOrder,
  fetchOrders
}