import axios from "axios";

const fetchStations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/stations')
      return response.data
    } catch (error) {
      console.error('Error fetching stations:', error)
    }
  }

export default fetchStations;