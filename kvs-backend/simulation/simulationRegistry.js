/**
 * Handles ownership and control of all instances of the 'restaurant simulator' running. 
 * Ensures that only one instance can be run per store.
 */

const { RestaurantSimulation } = require("./restaurantSimulation")
const { loadSampleData } = require("../order-generator/order-data/generateSampleData")

class SimulationRegistry {
    constructor() {
        this.simulations = new Map()
    }

    get(storeId) {
        return this.simulations.get(storeId)
    }

    isRunning(storeId) {
        return this.simulations.has(storeId)
    }

    // Starts a new simulation when the first KVS device connects, at the start of the business day. passes through a manual ending time if set.
    ensureRunning({ storeId, businessDayStart, endTime }) {
        if (this.isRunning(storeId)) return this.get(storeId)

        const sim = new RestaurantSimulation({
            storeId, 
            businessDayStart,
            endTime,
            onStop: () => {
                this.simulations.delete(storeId)
            },
            sampleData: loadSampleData(),
        })

        sim.start()
        this.simulations.set(storeId, sim)

        return sim
    }

    stop(storeId) {
        const sim = this.simulations.get(storeId)
        if (!sim) return
        sim.stop()
        this.simulations.delete(storeId)
    }
}

module.exports = new SimulationRegistry()