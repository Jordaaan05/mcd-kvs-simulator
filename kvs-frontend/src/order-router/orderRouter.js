import axios from "axios";
import fetchStations from "./fetch-modules/fetchStations";
import fetchItems from "./fetch-modules/fetchItems"
import mfyRouter from "./load-balancer/MFY";
import fcRouter from "./load-balancer/FC";
import cafeRouter from "./load-balancer/CAFE";

const routeOrder = async (newOrder) => {
    const stations = await fetchStations()
    const items = await fetchItems()
    
    let relevantKVS = []
    let fcSide = 1

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
        fcSide = parseInt(fcSideName.slice(2), 10);
        relevantKVS.push(fcSideName)
    } else if (registerValue >= 30 && registerValue <= 39) {
        // Drive Thru order, as the input register is between R30 and R39. 
        relevantKVS.push("DT1") // we do not want it to be sent to the park display until the park button is pushed.
    } else {
        console.log("Inputted register number is a non existent register.")
    }
    
    for (const item of newOrder.items) {
        const currentItem = items.find(i => i.id === item.id)
        const categoryName = currentItem.Categories[0].name;

        if (categoryName === "Beef") {
            if (!relevantKVS.includes("GRILL1")) {
                relevantKVS.push("GRILL1")
            }
        } else if (categoryName === "McCafe") {
            if (!relevantKVS.includes ("CAFE1") || !relevantKVS.includes("CAFE2")) {
                // mccafe load balancer
                const cafeSideName = await cafeRouter(stations);
                relevantKVS.push(cafeSideName);
            }
        } else if (categoryName === "Drinks" || categoryName === "Deserts") {
            if (!relevantKVS.includes("DRINKS1")) {
                relevantKVS.push("DRINKS1")
            }
        } else if (categoryName === "Sides") {
            if (!relevantKVS.includes("FRY1")) {
                relevantKVS.push("FRY1")
            }
        }
    }
    // tomorrow
    // route to drinks, grill, cafe etc if required.
    // allocate order number, 1 more than previous one (needs to consider/be apart of the FC, DT logic as these two have seperate order number tallies.)
    // Apply relevant order tags:
    /*  eat-in-take-out (If a front counter order, an EI or a TO must be displayed to symbolise eat in or take out. in drive thru this is left blank. TO ADD TO FC1)
        location (FC, DT, DLV? - displayed on all KVS except for FC and DT. TO ADD TO MFY1,2)
        orderLocation (Register, kiosk - for FC orders, displayed in the order footer next to the MFY side. TO ADD TO FC1!)
        mfySide done x
        timestamp (new Date())
        kvsToSendTo (based on the return from the order routing above ^) done x
    */

    const orderToAdd = {
        ...newOrder,
        kvsToSendTo: relevantKVS,
        mfySide: mfySide,
        FCSide: fcSide
    }

    try {
        await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}:5000/orders`, orderToAdd)
        console.log('Order added successfully');
    } catch (error) {
        console.error('Error adding order:', error)
    }
}

export default routeOrder;