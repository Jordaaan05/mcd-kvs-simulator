import axios from "axios";

const fetchCurrentBusinessDay = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/store/latest`);
        const currentBusinessDay = response.data.currentBusinessDay
        return currentBusinessDay;
    } catch (error) {
      console.error('Error fetching store information:', error)
    }
  }

export default fetchCurrentBusinessDay