/*
    Fetches the station data required for the orderRouter from the DB
*/

const { Stations } = require('../../models/database')

const fetchStations = async () => {
    try {
        const stations = await Stations.findAll()
        return stations
    } catch (err) {
        console.error('Error fetching stations:', err);
    }
}

module.exports = fetchStations