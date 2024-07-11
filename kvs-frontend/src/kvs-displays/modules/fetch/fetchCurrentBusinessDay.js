import axios from "axios";

const fetchCurrentBusinessDay = async () => {
    try {
        const response = await axios.get('http://localhost:5000/store/latest');
        const currentBusinessDay = response.data.currentBusinessDay
        return currentBusinessDay;
    } catch (error) {
      console.error('Error fetching store information:', error)
    }
  }

export default fetchCurrentBusinessDay