import axios from "axios";

let stations = []


const fetchStations = async () => {
    try {
        const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/stations`)
        stations = response.data;
    } catch (error) {
        console.error('Error fetching stations:', error)
    }
}

const toggleStationStatus = async (currentStation) => {
    await fetchStations();

    let onlineStations = [];
    const stationSameCategory = stations.filter(station => station.group === currentStation.group);
    for (let station of stationSameCategory) {
        if (station.id === currentStation.id) {
            continue
        }
        if (station.status === "ON") {
            onlineStations.push(station.id)
        }
    }
    if (onlineStations.length === 0) {
        console.log(`No other stations of the type ${currentStation.group} are online. Aborting...`)
        return
    }
    if (currentStation.status === "ON") {
        console.log(`Turning off ${currentStation.displayName}`)
        await axios.put(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/stations/${currentStation.id}`, {
            status: "OFF"
        })
    } else {
        console.log(`Turning on ${currentStation.displayName}`)
        await axios.put(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/stations/${currentStation.id}`, {
            status: "ON"
        })
    }

    await fetchStations();
    return stations.find(station => station.id === currentStation.id);
};

export default toggleStationStatus;