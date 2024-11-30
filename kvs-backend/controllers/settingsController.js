const { Settings } = require("../database/database")
const { broadcastMessage } = require('../modules/websocket')

const getAllSettings = async (req, res) => {
    try {
        const settings = await Settings.findAll()
        res.json(settings)
    } catch (err) {
        console.error('Error fetching settings:', err)
        res.status(500).json({ error: 'Failed to fetch orders' })
    }
}

const createSetting = async (req, res) => {
    const { name, value } = req.body

    if (name == "Setup-Complete") {
        broadcastMessage({ type: "SETUP-COMPLETE", data: "TRUE"})
    }

    try {
        const newSetting = await Settings.create({
            name: name,
            value: value
        })
        res.status(201).json(newSetting)
    } catch (err) {
        console.error('Error creating setting:', err)
        res.status(400).json({ error: 'Failed to create setting'})
    }
}

const updateSettingFromID = async (req, res) => {
    const { id } = req.params
    const { value } = req.body

    try {
        const setting = await Settings.findByPk(id)

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
    const { name } = req.params
    const { value } = req.body

    try {
        const setting = await Settings.findOne({ name: name })

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