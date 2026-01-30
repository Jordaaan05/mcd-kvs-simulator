import getActiveMFYSides from "../active-stations/activeMFY"
import { fetchOrders } from "../fetch-modules/fetchOrders"

let lastIndex = -1

const roundRobinAssign = (activeMfySides) => {
    lastIndex = (lastIndex + 1) % activeMfySides.length;
    return activeMfySides[lastIndex].name;
}

const mfyRouter = async (stations) => {
    const mfySides = stations.filter(station => station.group === "MFY")

    const activeMfySides = getActiveMFYSides(mfySides) // returns mfySides marked as ON
    const numActiveMfySides = activeMfySides.length

    if (numActiveMfySides === 1) {
        return activeMfySides[0].name;
    } else if (numActiveMfySides === 2) {
        // two sides running, load balancing applies (send to side with less orders).
        const sideA = activeMfySides[0].name;
        const sideB = activeMfySides[1].name;

        const sideAOrders = await fetchOrders(sideA)
        const sideBOrders = await fetchOrders(sideB)

        const numSideAOrders = sideAOrders.length
        const numSideBOrders = sideBOrders.length

        if (numSideAOrders === numSideBOrders) {
            return sideA;
        } else if (numSideAOrders > numSideBOrders) {
            return sideB;
        } else {
            return sideA;
        }
    } else if (numActiveMfySides >= 3) {
        // three or more sides running, use round robin rules
        return roundRobinAssign(activeMfySides)
    }
}

export default mfyRouter