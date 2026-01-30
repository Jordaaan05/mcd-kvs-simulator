import api from "../../modules/api";

const fetchOrders = async (stationName) => {
    try {
      const response = await api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders`);
      const filteredOrders = response.data.filter(order => !order.served?.[stationName]).filter(order => order.sendToKVS?.includes(stationName)); // Skip orders with servedTime
      return filteredOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

const fetchLastDTOrder = async () => {
  try {
    const response = await api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders/last/DT`);
    return response.data
  } catch (error) {
    console.error('Error fetching last DT order:', error);
  }
}

const fetchLastFCOrder = async () => {
  try {
    const response = await api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders/last/FC`);
    return response.data
  } catch (error) {
    console.error('Error fetching last FC order:', error);
  }
}

export {
  fetchOrders,
  fetchLastDTOrder,
  fetchLastFCOrder
}
