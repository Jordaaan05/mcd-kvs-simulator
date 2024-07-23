import axios from "axios";

const fetchItems = async () => {
    try {
        const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/options`);
        return response.data;
    } catch (error) {
        console.error('Error fetching item:', error);
    }
}

export default fetchItems;