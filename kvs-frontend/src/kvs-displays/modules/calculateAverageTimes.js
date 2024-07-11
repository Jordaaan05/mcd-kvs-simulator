const averageTimestampDifferenceLastHour = (orders, stationName, currentBusinessDay) => {
    const now = new Date();

    const oneHourAgo = now.getTime() - (60 * 60 * 1000); // Timestamp for one hour ago

    let filteredOrders = null
    if (new Date(oneHourAgo) < new Date(currentBusinessDay)) {
        // for when the day was opened within the last hour
        filteredOrders = orders.filter(order => order.served[stationName] && new Date(order.served[stationName]) > new Date(currentBusinessDay));
    } else {
        filteredOrders = orders.filter(order => order.served[stationName] && new Date(order.served[stationName]) > new Date(oneHourAgo));
    }

    if (filteredOrders.length === 0) {
        return 0; // Return 0 if no served orders in the last hour
    }
    const sumDifference = filteredOrders.reduce((acc, order) => {
        const difference = (new Date(order.served[stationName]) - new Date(order.createdAt)) / 1000; // Difference in seconds
        return acc + difference;
    }, 0);

    return Math.floor(sumDifference / filteredOrders.length); // Average difference in seconds
};

const averageTimestampDifferenceLast24Hours = (orders, stationName, currentBusinessDay) => {
    const now = new Date();
    const twentyFourHoursAgo = now.getTime() - (24 * 60 * 60 * 1000); // Timestamp for 24 hours ago

    let filteredOrders = null
    if (new Date(twentyFourHoursAgo) < new Date(currentBusinessDay)) {
        // for when the day was opened within the last day
        filteredOrders = orders.filter(order => order.served[stationName] && new Date(order.served[stationName]) > new Date(currentBusinessDay));
    } else {
        filteredOrders = orders.filter(order => order.served[stationName] && new Date(order.served[stationName]) > new Date(twentyFourHoursAgo));
    }

    if (filteredOrders.length === 0) {
        return 0; // Return 0 if no served orders in the last 24 hours
    }

    const sumDifference = filteredOrders.reduce((acc, order) => {
        const difference = (new Date(order.served[stationName]) - new Date(order.createdAt)) / 1000; // Difference in seconds
        return acc + difference;
    }, 0);

    return Math.floor(sumDifference / filteredOrders.length); // Average difference in seconds
};

module.exports = {
    averageTimestampDifferenceLast24Hours,
    averageTimestampDifferenceLastHour
}