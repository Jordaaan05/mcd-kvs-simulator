import api from "../api";

const fetchStation = async (stationName) => {
    try {
      const response = await api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/stations`)
      if (stationName) {
        const currentStation = response.data.find(station => station.name === stationName);
        return currentStation;
      } else {
        return response.data
      }
    } catch (error) {
      console.error('Error fetching stations:', error)
    }
  }

export default fetchStation;