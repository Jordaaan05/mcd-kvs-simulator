/* 
    Module for putting orders into the DB without the use of HTTP
*/

const { Order, Item } = require("../../database/database")  
const { broadcastMessage } = require("../../modules/websocket")

const createOrder = async (order) => {
    const { orderNumber, location, items, status, mfySide, timestamp, FCSide, kvsToSendTo, registerNumber, orderLocation, eatInTakeOut, businessDay } = order
  
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
        const dbItem = await Item.findOne({ where: { name: item.name } });
        if (dbItem) {
          await newOrder.addItem(dbItem, { through: { amount: item.amount } });
        }
      });
      await Promise.all(itemPromises)
  
      broadcastMessage({ type: "NEW_ORDER", data: [newOrder.id, kvsToSendTo] })
    } catch (err) {
      console.error('Error creating order:', err);
    }
  };
  
module.exports = createOrder