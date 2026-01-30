/* 
    Fetch and return the Categories array from the DB
*/

import api from "../api";

const fetchCategories = async () => {
    try {
      const response = await api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/categories`);
      return response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

export default fetchCategories