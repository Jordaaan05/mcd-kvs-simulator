import axios from "axios";

const fetchStation = async (stationName) => {
    try {
      const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/stations`)
      const currentStation = response.data.find(station => station.name === stationName);
      return currentStation;
    } catch (error) {
      console.error('Error fetching stations:', error)
    }
  }

export default fetchStation;