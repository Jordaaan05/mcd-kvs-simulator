const { Settings } = require("../models/database")
const { broadcastToRestaurant } = require('../modules/broadcaster')

const getAllSettings = async (req, res) => {
    const StoreId = req.user.storeId;
    try {
        const settings = await Settings.findAll({ where: { StoreId } })
        res.json(settings)
    } catch (err) {
        console.error('Error fetching settings:', err)
        res.status(500).json({ error: 'Failed to fetch orders' })
    }
}

const createSetting = async (req, res) => {
    const StoreId = req.user.storeId;
    const { name, value } = req.body;

    if (name == "Setup-Complete") {
        broadcastToRestaurant(StoreId, { type: "SETUP-COMPLETE", data: "TRUE"})
    }

    try {
        const newSetting = await Settings.create({
            name: name,
            value: value,
            StoreId
        })
        res.status(201).json(newSetting)
    } catch (err) {
        console.error('Error creating setting:', err)
        res.status(400).json({ error: 'Failed to create setting'})
    }
}

const updateSettingFromID = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;
    const StoreId = req.user.storeId;

    try {
        const setting = await Settings.findOne({
            where: {
                id,
                StoreId
            }
        });

        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' })
        }

        setting.value = value
        await setting.save()

        res.json(setting)
    } catch (err) {
        console.error('Error updating setting:', err)
        res.status(400).json({ error: 'Failed to update setting' })
    }
}

const updateSettingFromName = async (req, res) => {
    const { name } = req.params;
    const { value } = req.body;
    const StoreId = req.user.storeId;

    try {
        const setting = await Settings.findOne({ name: name, StoreId });

        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' })
        }

        setting.value = value
        await setting.save()

        res.json(setting)
    } catch (err) {
        console.error('Error updating setting:', err)
        res.status(400).json({ error: 'Failed to update setting' })
    }
}

module.exports = {
    getAllSettings,
    createSetting,
    updateSettingFromID,
    updateSettingFromName
}