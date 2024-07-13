import axios from "axios";
import fetchStations from "./fetch-modules/fetchStations";
import mfyRouter from "./side-router/MFY";
import fcRouter from "./side-router/FC";

const routeOrder = async (newOrder) => {
    const stations = await fetchStations()
    
    let relevantKVS = []

    // route to MFY
    const mfySideName = await mfyRouter(stations)
    const mfySide = parseInt(mfySideName.slice(3), 10);
    relevantKVS.push(mfySideName)

    const registerNumber = newOrder.registerNumber
    const registerValue = parseInt(registerNumber.slice(1), 10);

    /*  Typical register numbers:
        R1-R9: Front counter Till
        R20-R25: McCafe
        R30-R34: Drive Thru (R30 Order taker, R31 Cashier, R33 Order taker, R34 Cashier)
        R40-   : Instore Kiosk
    */

    if ((registerValue >= 1 && registerValue <= 29) || registerValue >= 40) {
        // Front Counter order, as the input register is between R1 and R29, or more than/equal to R40.
        const fcSideName = await fcRouter(stations)
        relevantKVS.push(fcSideName)
    } else if (registerValue >= 30 && registerValue <= 39) {
        // Drive Thru order, as the input register is between R30 and R39. 
        relevantKVS.push("DT1")
    } else {
        console.log("Inputted register number is a non existent register.")
    }
    
    // tomorrow
    // route to drinks, grill, cafe etc if required.
    // allocate order number, 1 more than previous one (needs to consider/be apart of the FC, DT logic as these two have seperate order number tallies.)
    // Apply relevant order tags:
    /*  eat-in-take-out (If a front counter order, an EI or a TO must be displayed to symbolise eat in or take out. in drive thru this is left blank. TO ADD TO FC1)
        location (FC, DT, DLV? - displayed on all KVS except for FC and DT. TO ADD TO MFY1,2)
        orderLocation (Register, kiosk - for FC orders, displayed in the order footer next to the MFY side. TO ADD TO FC1!)
        mfySide
        timestamp (new Date())
        kvsToSendTo (based on the return from the order routing above ^)
    */

    const orderToAdd = {
        ...newOrder,
        kvsToSendTo: relevantKVS,
        mfySide: mfySide
    }

    try {
        await axios.post('http://localhost:5000/orders', orderToAdd)
        console.log('Order added successfully');
    } catch (error) {
        console.error('Error adding order:', error)
    }
}

export default routeOrder;