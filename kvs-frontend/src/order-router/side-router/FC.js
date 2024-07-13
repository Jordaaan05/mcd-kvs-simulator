import getActiveFCSides from "../active-stations/activeFC";
import fetchOrders from "../fetch-modules/fetchOrders";

const fcRouter = (stations) => {
    const fcSides = stations.filter(station => station.group === "FC")

    const activeFcSides = getActiveFCSides(fcSides)
    const numActiveFcSides = activeFcSides.length

    if (numActiveFcSides === 1) {
        return activeFcSides[0].name;
    } else {
        // two sides running, load balancing applies.
        const sideA = activeFcSides[0].name;
        const sideB = activeFcSides[1].name;

        const sideAOrders = fetchOrders(sideA)
        const sideBOrders = fetchOrders(sideB)

        const numSideAOrders = sideAOrders.length
        const numSideBOrders = sideBOrders.length

        if (numSideAOrders === numSideBOrders) {
            return sideA;
        } else if (numSideAOrders > numSideBOrders) {
            return sideB;
        } else {
            return sideA;
        }
    }
}

export default fcRouter