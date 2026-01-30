/**
 * Owns all timers and lifecycles for each store. Interfaces with the order generator directly.
 */

const { RestaurantClock } = require('./restaurantClock')
const { Settings, Category, Item, Store, CustomerCount } = require("../models/database")
const { generateOrder } = require("../order-generator/generateOrder")
const { applyVariation } = require("./demandUtils")


class RestaurantSimulation {
    constructor({ storeId, businessDayStart, endTime, onStop, sampleData }) {
        this.storeId = storeId;
        this.businessDayStart = businessDayStart;
        this.endTime = endTime ?? null;
        this.onStop = onStop;
        this.sampleData = sampleData;

        this.running = false;
        this.lastActiveAt = Date.now();
        this.timeouts = [];
        this.orderTimeouts = [];
        this.intervals = [];
        this.activeConnections = 0;
        this.disconnectTimeout = null;

        this.clock = new RestaurantClock({
            startTime: Date.now(),
            speed: 1
        });
    }

    start() {
        if (this.running) return
        this.running = true

        console.log(`[R#${this.storeId}] Starting simulation...`)

        this.startInactivityWatcher()
        this.startBusinessDayWatcher()
        this.startQuarterScheduler()
    }

    stop(reason = "unknown") {
        if (!this.running) return
        this.running = false

        console.log(`[R#${this.storeId}] Stopping simulation... (${reason})`)

        this.timeouts.forEach(clearTimeout)
        this.intervals.forEach(clearInterval)

        this.timeouts = []
        this.intervals = []

        this.onStop?.()
    }

    // Activity tracking

    markActive() {
        this.lastActiveAt = Date.now()
    }

    onClientConnected() {
        this.activeConnections++;
        this.markActive();

        if (this.disconnectTimeout) {
            clearTimeout(this.disconnectTimeout);
            this.disconnectTimeout = null;
            console.log(`[R#${this.storeId}] Disconnect timeout aborted (client reconnected)`);
        }
    }

    onClientDisconnected() {
        this.activeConnections = Math.max(0, this.activeConnections - 1); // to prevent negative situations

        if (this.activeConnections === 0 && !this.disconnectTimeout) {
            console.log(`[R#${this.storeId}] Last KVS device disconnected, stopping in 30s`);
        }

        this.disconnectTimeout = setTimeout(() => {
            this.disconnectTimeout = null;
            this.stop("Last KVS device disconnected")
        }, 30 * 1000);
    }

    // Watchers 

    startInactivityWatcher() {
        const interval = setInterval(() => {
            const inactiveFor = Date.now() - this.lastActiveAt
            const MAX_INACTIVE = 120 * 60 * 1000

            if (inactiveFor > MAX_INACTIVE) {
                this.stop("Inactivity exceeded 15 minute timeout")
            }
        }, 60 * 1000)

        this.intervals.push(interval)
    }

    startBusinessDayWatcher() {
        const interval = setInterval(() => {
            const simAge = this.clock.now() - this.businessDayStart;
            const MAX_AGE = 24 * 60 * 60 * 1000;

            if (simAge >= MAX_AGE) {
                this.stop("Business day expired")
            }

            if (this.endTime && this.clock.now() >= this.endTime) {
                this.stop("Set end time reached")
            }
        }, 60 * 1000)

        this.intervals.push(interval)
    }

    // Simulation loop

    startQuarterScheduler() {
        const now = new Date(this.clock.now());
        const msToNextQuarter = (15 - (now.getMinutes() % 15)) * 60 * 1000 - 
        now.getSeconds() * 1000 - 
        now.getMilliseconds();

        this.run15MinInterval();
        const firstTimeout = setTimeout(() => {
            this.run15MinInterval();

            const interval = setInterval(() => {
                this.run15MinInterval();
            }, 15 * 60 * 1000);

            this.intervals.push(interval);
        }, msToNextQuarter);

        this.timeouts.push(firstTimeout);
        console.log(`[R#${this.storeId}] Started first interval, ${now.toLocaleTimeString()} - ${new Date(now.getTime() + msToNextQuarter).toLocaleTimeString()}`)
    }

    // Simulation methods
    async run15MinInterval() {
        if (!this.running) return

        this.cleanOrderTimeouts();

        const intervalStart = new Date(this.clock.now());

        const day = intervalStart.getDay();
        const month = intervalStart.getMonth();
        const hour = intervalStart.getHours();

        const key = `${month}-${day}-${hour}`

        const getCustomerCount = (type) => {
            const base = this.sampleData?.data?.[key]?.[type] ?? 0;
            return applyVariation(base);
        }

        const frontCounterCount = getCustomerCount("FC");
        const driveThruCount = getCustomerCount("DT");

        console.log(
            `[R#${this.storeId}] Interval ${intervalStart.toLocaleTimeString()}\n  FC: ${frontCounterCount}\n  DT: ${driveThruCount}`
        );

        this.scheduleOrders(frontCounterCount, "FC")
    }

    scheduleOrders(count, type) {
        const timeRange = 15 * 60 * 1000;
        let executedIndex = 0;

        for (let i = 0; i < count; i++) {
            const delay = Math.floor(Math.random() * timeRange)
            const timeout = setTimeout(async () => {
                if (!this.running) return;
                executedIndex++;
                await this.executeOrderGenerator(type, delay, executedIndex, count);
            }, delay)

            this.orderTimeouts.push(timeout);
        };
    }

    cleanOrderTimeouts() {
        this.orderTimeouts.forEach(clearTimeout);
        this.orderTimeouts = [];
    }

    // Order executor

    async executeOrderGenerator(customerLocation, delay, index, count) {
        const settingsRaw = await Settings.findAll({ where: { storeId: this.storeId } });
        const settings = settingsRaw.map(s => s.dataValues);

        const items = await Item.findAll({ include: Category });
        const store = await Store.findOne({ where: { id: this.storeId }, order: [['createdAt', 'DESC']] });

        if (settings.find(s => s.name === "Generator-Enabled")?.value === "On") {
            console.log(`[R#${this.storeId}] Scheduled order ${index}/${count} (${customerLocation}) after ${delay} ms`);
            generateOrder(this.storeId, settings, items, store.currentBusinessDay, customerLocation, this.clock);
        } else {
            console.log(`[R#${this.storeId}] Attempted to schedule order ${index}/${count} (${customerLocation}) after ${delay} ms, but generator is disabled. `)
        };
    }
}

module.exports = { RestaurantSimulation }