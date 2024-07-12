import axios from "axios";
import fetchStations from "./fetch-modules/fetchStations";
import mfyRouter from "./side-router/MFY";

const routeOrder = async (newOrder) => {
    const stations = await fetchStations()
    
    let relevantKVS = []
    
    const mfySideName = mfyRouter(stations)
    relevantKVS.push(mfySideName)

    // route to MFY done :)
    // route to FC (if FC order, based off register number, R1-R29, R40-)
    // route to DT (if DT order, based off register number, R30-R39)
    // Apply relevant order tags:
    /*  location
        mfySide
        timestamp (new Date())
        kvsToSendTo (based on the return from the order routing above ^)
    */
}

export default routeOrder;