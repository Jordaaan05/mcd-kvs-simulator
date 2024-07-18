import axios from "axios";

const fetchStations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/stations`)
      return response.data
    } catch (error) {
      console.error('Error fetching stations:', error)
    }
  }

export default fetchStations;