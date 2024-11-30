/* 
    Runs the order generator on a 10s timer, refreshes DB imports.
*/

// DB imports
const { Settings, Category, Item, Store } = require("../database/database")

// Module imports
const { generateOrder } = require("./generateOrder")


const executeOrderGenerator = () => {
    setInterval(async () => {
        let currentSettingsRaw = await Settings.findAll()
        let currentSettings = currentSettingsRaw.map(setting => setting.dataValues)
        let currentItems = await Item.findAll({ include: Category })
        let currentStore = await Store.findOne({ order: [['createdAt', 'DESC']] })
        if (currentSettings.find(setting => setting.name === "Generator-Enabled").value === "On") {
            generateOrder(currentSettings, currentItems, currentStore.currentBusinessDay)
        }
    }, 5000)
}

module.exports = { executeOrderGenerator }