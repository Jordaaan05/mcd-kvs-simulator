import axios from "axios";

const fetchSettings = async () => {
    try {
      const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/settings`)
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

export default fetchSettings;