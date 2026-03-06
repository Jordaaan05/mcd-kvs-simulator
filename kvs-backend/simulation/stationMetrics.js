/**
 * Station metrics class, stores all relevant information for calculating station time averages per KVS station.
 */

class StationMetrics {
    totalCount = 0;
    totalSeconds = 0;

    lastHourQueue = [];
    lastHourCount = 0;
    lastHourSeconds = 0;

    recordServe(servedAt, durationSeconds) {
        this.totalCount++;
        this.totalSeconds += durationSeconds;

        this.lastHourQueue.push({
            servedAt,
            duration: durationSeconds
        });

        this.lastHourCount++;
        this.lastHourSeconds += durationSeconds;

        this.pruneLastHour(servedAt);
    }

    pruneLastHour(now) {
        const oneHourAgo = now - (60 * 60 * 1000);

        while (
            this.lastHourQueue.length > 0 &&
            this.lastHourQueue[0].servedAt < oneHourAgo
        ) {
            const expired = this.lastHourQueue.shift();
            this.lastHourCount--;
            this.lastHourSeconds -= expired.duration;
        }
    }

    getAverages() {
        return {
            lastHour:
                this.lastHourCount === 0
                    ? 0
                    : Math.floor(this.lastHourSeconds / this.lastHourCount),

            last24Hours:
                this.totalCount === 0
                    ? 0
                    : Math.floor(this.totalSeconds / this.totalCount)
        };
    }
}

module.exports = StationMetrics;