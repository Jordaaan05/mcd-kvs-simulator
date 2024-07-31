/*
    Fetch and return an the options array from the DB
*/
import axios from "axios";

const fetchOptions = async () => {
    try {
      const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/options`);
      return response.data
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

export default fetchOptions