/* 
    Runs the order generator on a 10s timer, refreshes DB imports.
*/

// DB imports
const { Settings, Category, Item } = require("../database")

// Module imports
const { generateOrder } = require("./generateOrder")


const executeOrderGenerator = () => {
    setInterval(async () => {
        let currentSettingsRaw = await Settings.findAll()
        let currentSettings = currentSettingsRaw.map(setting => setting.dataValues)
        let currentItems = await Item.findAll({ include: Category })
        if (currentSettings.find(setting => setting.name === "Generator-Enabled").value === "On") {
            generateOrder(currentSettings, currentItems)
        }
    }, 5000)
}

module.exports = { executeOrderGenerator }