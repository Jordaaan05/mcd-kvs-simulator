const { Order, Item, Category } = require('../models/database')

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll()
        res.json(categories)
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Failed to fetch categories' })
    }
}

const createCategory = async (req, res) => {
    const { name, sortID } = req.body;

    try {
        const newCategory = await Category.create({
            name,
            sortID
        });

        res.status(201).json(newCategory);
    } catch (err) {
        console.error('Error creating order:', err)
        res.status(400).json({ error: 'Failed to create category'});
    }
};

const deleteCategory = async () => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);

        if (!category) {
            return req.status(404).json({ error: 'Category not found' })
        }

        await category.destroy();

        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error('Error deleting order:', err)
        res.status(400).json({ error: 'Failed to delete category'});
    }
}

module.exports = {
    getAllCategories,
    createCategory,
    deleteCategory
}