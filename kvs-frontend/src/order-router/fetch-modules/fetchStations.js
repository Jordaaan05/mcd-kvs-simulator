import api from "../../modules/api";

const fetchStations = async () => {
    try {
      const response = await api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/stations`)
      return response.data
    } catch (error) {
      console.error('Error fetching stations:', error)
    }
  }

export default fetchStations;