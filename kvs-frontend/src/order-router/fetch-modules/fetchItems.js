import axios from "axios";

const fetchItems = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}:5000/options`);
        return response.data;
    } catch (error) {
        console.error('Error fetching item:', error);
    }
}

export default fetchItems;