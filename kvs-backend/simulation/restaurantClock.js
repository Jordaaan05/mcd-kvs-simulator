class RestaurantClock {
    /**
     * @param {Object} options 
     * @param {number|Date} options.startTime - simulated epoch time in ms
     * @param {number} options.speed - simulation speed multiplier (1 = real time) 
     */
    constructor({ startTime, speed = 1 }) {
        this.startTime = typeof startTime === "number" ? startTime : new Date(startTime).getTime();
        this.speed = speed;
        this.realStart = Date.now();
    }

    /**
     * Calculates the current time of the simulation
     * @returns current simulated timestamp in ms
     */
    now() {
        const realElapsed = Date.now() - this.realStart
        return this.startTime + realElapsed * this.speed
    }

    /**
     * Manually advances the clock
     */
    advance(ms) {
        this.startTime += ms;
    }

    /**
     * Update the speed of the simulation
     * @param {number} speed - simulation speed
     */
    setSpeed(speed) {
        this.startTime = this.now(); // Commit elapsed time
        this.realStart = Date.now(); // update reference point
        this.speed = speed;
    }
}

module.exports = { RestaurantClock }