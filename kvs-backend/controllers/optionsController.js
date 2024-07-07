const { Order, Item, Category } = require('../database')

const getAllOptions = async (req, res) => {
    try {
        const options = await Item.findAll({ include: Category })
        res.json(options)
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
};

const createOption = async (req, res) => {
    const { name, category, price, display } = req.body

    try {
        const newOption = await Item.create({
            name,
            price,
            display
        });

        const dbCategory = await Category.findOne({ where: { name: category }});
        if (dbCategory) {
            await newOption.addCategory(dbCategory)
        }

        res.status(201).json(newOption)
    } catch (err) {
        console.error('Error creating Option:', err)
        res.status(400).json({ error: 'Failed to create option '})
    }
};

const deleteOption = async (req, res) => {
    const { id } = req.params;

    try {
        const option = await Item.findByPk(id);

        if (!option) {
            return res.status(404).json({ error: 'Option not found' })
        }

        await option.destroy();

        res.json({ message: 'Option deleted' })
    } catch (err) {
        console.error('Error deleting order:', err)
        res.status(400).jsonm({ error: 'Failed to delete order'})
    }
}

module.exports = {
    getAllOptions,
    createOption,
    deleteOption
}