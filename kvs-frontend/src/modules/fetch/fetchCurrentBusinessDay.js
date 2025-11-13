import axios from "axios";
import { jwtDecode } from "jwt-decode"

const fetchCurrentBusinessDay = async () => {
    try {
        const token = sessionStorage.getItem("token")
        if (!token) throw new Error("No auth token found") 

        const decoded = jwtDecode(token)
        const storeId = decoded.storeId

        const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/store/${storeId}`);
        const currentBusinessDay = response.data.currentBusinessDay
        return currentBusinessDay;
    } catch (error) {
      console.error('Error fetching store information:', error)
    }
  }

export default fetchCurrentBusinessDay