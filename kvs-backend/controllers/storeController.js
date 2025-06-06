const { Store } = require('../database/database')
const { broadcastMessage } = require('../modules/websocket')

const getCurrentStoreInfo = async (req, res) => {
    try {
        const store = await Store.findAll()
        res.json(store)
    } catch (err) {
        console.error('Error fetching store information:', err);
        res.status(500).json({ error: 'Failed to fetch store information' });
    }
}

const insertCurrentStoreInfo = async (req, res) => {
    const { businessDate } = req.body;

    try {
        const newStoreInfo = await Store.create({
            currentBusinessDay: businessDate
        });

        broadcastMessage({ type: "STORE_INFO_UPDATED", data: newStoreInfo });

        res.status(201).json(newStoreInfo)
    } catch (err) {
        console.error("Error inserting information:", err)
        res.status(400).json({ error: 'Failed to insert new store information '})
    }
}

const getMostRecentStoreInfo = async (req, res) => {
    try {
        const store = await Store.findOne({
            order: [['createdAt', 'DESC']]
        })
        res.json(store)
    } catch (err) {
        console.error('Error fetching store information:', err);
        res.status(500).json({ error: 'Failed to fetch store information' });
    }
}

const updateBusinessDay = async (req, res) => {
    const { storeId } = req.params
    const { businessDate } = req.body;

    try {
        await Store.update({ currentBusinessDay: businessDate }, { where: { id: storeId } })

        broadcastMessage({ type: "STORE_INFO_UPDATED", data: businessDate })
    } catch (err) {
        console.error('Error updating business day:', err);
    }
}

const getBusinessDayByID = async (req, res) => {
    const { storeId } = req.params
    
    try {
        const store = await Store.findOne({ where: {id: storeId}})
        res.json(store)
    } catch (err) {
        console.error('Error fetching store information:', err);
        res.status(500).json({ error: 'Failed to fetch store information' });
    }
}

module.exports = {
    getCurrentStoreInfo,
    insertCurrentStoreInfo,
    getMostRecentStoreInfo,
    updateBusinessDay,
    getBusinessDayByID
}