const { Item, Category } = require('../models/database')

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

const modifyOption = async (req, res) => {
    const { id } = req.params;
    const { name, price, display, category } = req.body;

    try {
        const option = await Item.findByPk(id);

        if (!option) {
            return res.status(404).json({ error: "Option not found" })
        }

        option.name = name;
        option.price = price;
        option.display = display;

        await option.save();

        if (typeof category !== 'undefined') {
            const dbCategory = await Category.findOne({ where: { name: category }});
            if (dbCategory) {
                if (typeof option.setCategories === 'function') {
                    await option.setCategories([dbCategory]);
                } else if (typeof option.setCategory === 'function') {
                    await option.setCategory(dbCategory);
                }
            };
        };

        const optionWithCategory = await Option.findByPk(option.id, { include: Category });
        res.json(optionWithCategory || option);
    } catch (err) {
        console.error("Error updating Option:", err);
        res.status(400).json({ error: "Error updating option" });
    }
}

module.exports = {
    getAllOptions,
    createOption,
    deleteOption,
    modifyOption
}