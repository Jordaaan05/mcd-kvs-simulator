/*
    Fetch and return an the options array from the DB
*/
import api from "../api";

const fetchOptions = async () => {
    try {
      const response = await api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/options`);
      return response.data
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

export default fetchOptions