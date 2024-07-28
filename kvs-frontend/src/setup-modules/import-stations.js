/*
    Import the stations from file into the database
*/
import { kvsDisplays } from "../default_store/kvsDisplays"
import axios from "axios"
import fetchStations from "../order-router/fetch-modules/fetchStations"

const importStations = async () => {
    const stations = await fetchStations() || []

    for (let kvsDisplay of kvsDisplays) {
      if (!kvsDisplay.displayName) {
        kvsDisplay.displayName = kvsDisplay.name
      }

      const stationExists = stations.find(station => station.name === kvsDisplay.name)
      if (!stationExists) {
        await axios.post(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/stations`, {
          name: kvsDisplay.name,
          group: kvsDisplay.group,
          displayName: kvsDisplay.displayName,
          status: kvsDisplay.status
        })
        console.log('Station added successfully');
      } else {
        console.log('Station already exists...')
      }
    }
  }

export default importStations