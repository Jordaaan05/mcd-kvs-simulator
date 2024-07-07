import axios from "axios";

const fetchStation = async (stationName) => {
    try {
      const response = await axios.get('http://localhost:5000/stations')
      const currentStation = response.data.find(station => station.name === stationName);
      return currentStation;
    } catch (error) {
      console.error('Error fetching stations:', error)
    }
  }

export default fetchStation;