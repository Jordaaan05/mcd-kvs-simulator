/* 
    Runs the order generator on a 10s timer, refreshes DB imports.
*/

// DB imports
const { Settings, Category, Item, Store, CustomerCount } = require("../models/database")

// Module imports
const { generateOrder } = require("./generateOrder")

const storeCustomerCount = async (intervalStart, intervalEnd, frontCounterCount, driveThruCount) => {
    try {
      await CustomerCount.create({
        intervalStart,
        intervalEnd,
        frontCounterCount,
        driveThruCount
      });
    } catch (err) {
      console.error('Error storing customer count:', err);
    }
  };


let currentTimeouts = []
const simulate15MinInterval = async (intervalStart, sampleData) => {

    currentTimeouts.forEach(clearTimeout)
    currentTimeouts = []

    const intervalEnd = new Date(intervalStart.getTime() + 15 * 60 * 1000)

    const day = intervalStart.getDay();       // 0 (Sun) - 6 (Sat)
    const month = intervalStart.getMonth();   // 0 (Jan) - 11 (Dec)
    const hour = intervalStart.getHours();    // 0 - 23

    const key = `${month}-${day}-${hour}`;   // e.g., "11-6-0"

    const getCustomerCount = (type) => {
        const baseCount = sampleData['data']?.[key]?.[type] ?? 0;
        return applyVariation(baseCount);
    };

    try {
        const frontCounterCount = getCustomerCount('FC');
        const driveThruCount = getCustomerCount('DT');
      
        console.log("Order Scheduler running for interval starting:", `${intervalStart.toLocaleString("en-GB")}`, "\nVolumes:\n   Front:", frontCounterCount, "\n   Drive:", driveThruCount);
      
        await storeCustomerCount(intervalStart, intervalEnd, frontCounterCount, driveThruCount);
      
        const scheduleOrders = async (count, type) => {
            const timeRange = 15 * 60 * 1000;
            let executedIndex = 0
            for (let i = 0; i < count; i++) {
                const delay = Math.floor(Math.random() * timeRange);
                const timeoutId = setTimeout(async () => {
                    executedIndex++
                    console.log(`Scheduled order ${executedIndex}/${count} (${type}) after ${delay}ms`);
                    await executeOrderGenerator(type);
                }, delay);

                currentTimeouts.push(timeoutId)
            }
        };
      
        await Promise.all([
            scheduleOrders(frontCounterCount, 'FC'),
            // scheduleOrders(driveThruCount, 'DT'), TEMP OFF UNTIL DT IMPLEMENTED
        ]);
    } catch (error) {
      console.error("Error during simulate15MinInterval:", error);
    }
}

const applyVariation = (baseCount) => {
  const variationFactor = 1 + (Math.random() * (0.2 + 0.35) - 0.35); // from 0.65 to 1.2
  return Math.max(0, Math.round(baseCount * variationFactor));
};

const executeOrderGenerator = async (customerLocation) => {
    let currentSettingsRaw = await Settings.findAll()
    let currentSettings = currentSettingsRaw.map(setting => setting.dataValues)
    let currentItems = await Item.findAll({ include: Category })
    let currentStore = await Store.findOne({ order: [['createdAt', 'DESC']] })
    if (currentSettings.find(setting => setting.name === "Generator-Enabled").value === "On") {
        generateOrder(currentSettings, currentItems, currentStore.currentBusinessDay, customerLocation)
    }
}

module.exports = { simulate15MinInterval }