import getActiveMFYSides from "../active-stations/activeMFY"
import fetchOrders from "../fetch-modules/fetchOrders"

let lastIndex = -1

const roundRobinAssign = (activeMfySides) => {
    lastIndex = (lastIndex + 1) % activeMfySides.length;
    return activeMfySides[lastIndex].name;
}

const mfyRouter = (stations) => {
    const mfySides = stations.filter(station => station.group === "MFY")

    const activeMfySides = getActiveMFYSides(mfySides) // returns mfySides marked as ON
    const numActiveMfySides = length(activeMfySides)

    if (numActiveMfySides === 1) {
        return activeMfySides[0].name;
    } else if (numActiveMfySides === 2) {
        // two sides running, load balancing applies.
        const sideA = activeMfySides[0].name;
        const sideB = activeMfySides[1].name;

        const sideAOrders = fetchOrders(sideA)
        const sideBOrders = fetchOrders(sideB)

        const numSideAOrders = length(sideAOrders);
        const numSideBOrders = length(sideBOrders);

        if (numSideAOrders === numSideBOrders) {
            return sideA;
        } else if (numSideAOrders > numSideBOrders) {
            return sideB;
        } else {
            return sideA;
        }
    } else if (numActiveMfySides >= 3) {
        return roundRobinAssign(activeMfySides)
    }
}

export default mfyRouter