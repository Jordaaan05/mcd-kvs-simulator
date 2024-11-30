/* 
    Fetch the required item information for the order router from the DB
*/

const { Item, Category } = require('../../database/database')

const fetchItems = async () => {
    try {
        const options = await Item.findAll({ include: Category })
        return options
    } catch (err) {
        console.error('Error fetching items:', err);
    }
}

module.exports = fetchItems