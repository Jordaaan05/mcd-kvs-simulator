/* 
    Calculates the base rate in which orders are generated.
*/

const calculateBaseRate = (currentSettings, currentHour, storeCharacteristics) => {
    let baseRate =  0.1

    /* 
        Base Rate explained:
        0.1 = 10% chance for an order to be created, so an order will come through roughly every 50 seconds.
        0.2 = 20% chance, order every 25 ish seconds
        0.3 = 30% chance, order every 16 and a bit seconds
        ....
        1 = 100% chance, order every 5 seconds

    */
     
    const storeSizeSetting = currentSettings.find(setting => setting.name === "Store-Size")
    if (storeSizeSetting.value === "Food Court") {
        baseRate *= 0.25
    } else if (storeSizeSetting.value === "Small") {
        baseRate *= 0.5
    } else if (storeSizeSetting.value === "Medium") {
        baseRate *= 0.65
    } else {
        baseRate *= 0.9
    }

    const orderArrivalRateMap = {
        "Slow": 1.2,
        "Typical": 1.7,
        "Peak": 3.6,
        "Max": 6
    }

    const rushPeriodMap = {
        "Breakfast": 2.7,
        "Lunch": 3,
        "Dinner": 3.2,
        "Friday Night": 4.3
    }
    
    const orderArrivalRate = currentSettings.find(setting => setting.name === "Order-Arrival-Rate")
    const rushPeriod = currentSettings.find(setting => setting.name === "Rush-Period")
    if (rushPeriod.value !== "Off") {
        // Rush period is enabled, ignore literally everything else
        baseRate *= rushPeriodMap[rushPeriod.value]
    } else if (orderArrivalRate.value === "Off") {
        // If there is no order arrival rate set, control based off of the time.
        const rushPeriods = storeCharacteristics.rushPeriods
        for (const key in rushPeriods) {
            if (rushPeriods[key].includes(currentHour)) {
                baseRate *= rushPeriodMap[key]
            }
        }

        const typicalPeriods = storeCharacteristics.typicalPeriods
        if (typicalPeriods.includes(currentHour)) {
            baseRate *=1.7
        }

        const transitionalPeriods = storeCharacteristics.transitionalPeriods
        if (transitionalPeriods.includes(currentHour)) {
            baseRate *= 2.3
        }
    } else if (orderArrivalRate.value !== "Off") {
        baseRate *= orderArrivalRateMap[orderArrivalRate.value]
    }
    
    // adjust base rate here for other factors, like day types etc. future addition

    return baseRate
} 

module.exports = { calculateBaseRate }