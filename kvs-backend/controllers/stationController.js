const { Stations } = require('../models/database');

const getAllStations = async (req, res) => {
    const StoreId = req.user.storeId;

    try {
        const stations = await Stations.findAll({ where: { StoreId } })
        res.json(stations)
    } catch (err) {
        console.error('Error fetching stations:', err);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
}

const getStationByName = async (req, res) => {
    const { name } = req.params;
    const StoreId = req.user.storeId;

    try {
        const station = await Stations.findOne({ where: { name, StoreId } })
        if (!station) return res.status(404).json({ error: 'Station not found' });
        res.json(station);
    } catch (err) {
        console.error('Error fetching station by name:', err)
        res.status(500).json({ error: 'Failed to fetch station' });
    }
}

const createStation = async (req, res) => {
    const StoreId = req.user.storeId;
    const { name, group, status, displayName } = req.body;

    try {
        const newStation = await Stations.create({
            name,
            group,
            displayName,
            status,
            StoreId
        });

        res.status(201).json(newStation)
    } catch (err) {
        console.error('Error creating station:', err);
        res.status(400).json({ error: 'Failed to create station' })
    }
};

const updateStationStatus = async (req, res) => {
    const { id } = req.params;
    const { name, group, status, displayName,  } = req.body;
    const StoreId = req.user.storeId;

    try {
        const station = await Stations.findOne({
            where: {
                id,
                StoreId
            }
        });

        if (!station) {
            return res.status(404).json({ error: 'Station not found' })
        }

        if (name) station.name = name;
        if (status) station.status = status;
        if (group) station.group = group;
        if (displayName) station.displayName = displayName;
        await station.save();

        res.json(station);
    } catch (err) {
        console.error('Error updating station:', err);
        res.status(400).json({ error: 'Failed to update station' });
    }
}

module.exports = {
    getAllStations,
    getStationByName,
    createStation,
    updateStationStatus
}