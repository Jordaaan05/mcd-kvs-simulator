import axios from "axios";
import fetchStations from "./fetch-modules/fetchStations";
import fetchItems from "./fetch-modules/fetchItems"
import mfyRouter from "./load-balancer/MFY";
import fcRouter from "./load-balancer/FC";
import cafeRouter from "./load-balancer/CAFE";
import { fetchLastDTOrder, fetchLastFCOrder } from './fetch-modules/fetchOrders'

let lastFCOrderNumber = -1
let lastDTOrderNumber = -1

const assignOrderNumber = async (location) => {
    // i probably shouldve put this in a seperate file like everything else here but oh well lol
    if (lastDTOrderNumber === -1) {
        const lastDTOrder = await fetchLastDTOrder()
        lastDTOrderNumber = parseInt(lastDTOrder.orderNumber)
    }

    if (lastFCOrderNumber === -1) {
        const lastFCOrder = await fetchLastFCOrder()
        lastFCOrderNumber = parseInt(lastFCOrder.orderNumber)
    }
    
    if (location === "DT") {
        if (lastDTOrderNumber < 99) {
            lastDTOrderNumber += 1
            if (lastDTOrderNumber > 10) {
                return `lastDTOrderNumber`
            } else {
                return `0${lastDTOrderNumber}`
            }
        } else {
            lastDTOrderNumber = 0
            return `0${lastDTOrderNumber}`
        }
    } else {
        // location is FC
        if (lastFCOrderNumber < 99) {
            // the last order number + 1 must be less than 100, as 99 is the max displayable.
            lastFCOrderNumber += 1
            if (lastFCOrderNumber > 9) {
                return `${lastFCOrderNumber}`
            } else {
                return `0${lastFCOrderNumber}`
            }
        } else {
            lastFCOrderNumber = 0
            return `0${lastFCOrderNumber}`
        }
    }
}

const routeOrder = async (newOrder) => {
    const stations = await fetchStations()
    const items = await fetchItems()
    
    let relevantKVS = []
    let fcSide = 1
    let orderNumber = ""
    let orderLocation = ""
    let eatInTakeOut = ""
    let orderLocationInStore = ""

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

        // assign order number
        orderNumber = await assignOrderNumber("FC")
        orderLocation = "FC"

        // if eat-in/take-out not selected
        if (!newOrder.eatInTakeOut) {
            eatInTakeOut = "TO"
        }

        if (!newOrder.orderLocation) {
            orderLocationInStore = "Register"
        }

    } else if (registerValue >= 30 && registerValue <= 39) {
        // Drive Thru order, as the input register is between R30 and R39. 
        relevantKVS.push("DT1") /*  we do not want it to be sent to the park display (DT2) until the park button is pushed,
                                    on the DT bump bar. */

        // assign order number
        orderNumber = await assignOrderNumber("DT")
        orderLocation = "DT"

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

    const orderToAdd = {
        ...newOrder,
        kvsToSendTo: relevantKVS,
        mfySide: mfySide,
        FCSide: fcSide,
        orderNumber: orderNumber,
        location: orderLocation,
        eatInTakeOut: eatInTakeOut,
        orderLocation: orderLocationInStore
    }

    try {
        await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders`, orderToAdd)
        console.log('Order added successfully');
    } catch (error) {
        console.error('Error adding order:', error)
    }
}

export default routeOrder;