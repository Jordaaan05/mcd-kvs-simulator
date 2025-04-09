/* 
    Runs the order generator on a 10s timer, refreshes DB imports.
*/

// DB imports
const { Settings, Category, Item, Store, CustomerCount } = require("../database/database")

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

const simulate15MinInterval = async (intervalStart, sampleData) => {
    const intervalEnd = new Date(intervalStart.getTime() + 15 * 60 * 1000)

    const currentDay = intervalStart.toLocaleString('en-US', { weekday: 'long' })
    const currentMonth = intervalStart.toLocaleString('en-US', { month: 'long' })
    const currentHour = intervalStart.getHours()
    const currentMinute = intervalStart.getMinutes()

    const getCustomerCount = (type) => {
        const baseCount = 
    }
}

const executeOrderGenerator = async (customerLocation) => {
    let currentSettingsRaw = await Settings.findAll()
    let currentSettings = currentSettingsRaw.map(setting => setting.dataValues)
    let currentItems = await Item.findAll({ include: Category })
    let currentStore = await Store.findOne({ order: [['createdAt', 'DESC']] })
    if (currentSettings.find(setting => setting.name === "Generator-Enabled").value === "On") {
        generateOrder(currentSettings, currentItems, currentStore.currentBusinessDay, customerLocation)
    }
}

module.exports = { executeOrderGenerator }