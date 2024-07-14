import getActiveCAFESides from "../active-stations/activeCAFE"
import fetchOrders from "../fetch-modules/fetchOrders"

const cafeRouter = async (stations) => {
    const cafeSides = stations.filter(station => station.group === "CAFE");

    const activeCafeSides = getActiveCAFESides(cafeSides);
    const numActiveCafeSides = activeCafeSides.length;

    if (numActiveCafeSides === 1) {
        return activeCafeSides[0].name;
    } else if (numActiveCafeSides === 2) {
        // two sides running, load balancing applies.
        const sideA = activeCafeSides[0].name;
        const sideB = activeCafeSides[1].name;

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
    }
}

export default cafeRouter