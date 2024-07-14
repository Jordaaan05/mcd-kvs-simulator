import axios from "axios";

const fetchOrders = async (stationName) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}:5000/orders`);
      const filteredOrders = response.data.filter(order => !order.served?.[stationName]).filter(order => order.sendToKVS?.includes(stationName)); // Skip orders with servedTime
      return filteredOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

export default fetchOrders;