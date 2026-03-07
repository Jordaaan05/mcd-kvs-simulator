class WeatherGenerator {
    constructor() {
        this.baseEvents = [
            { label: "Overcast", probability: 0.33, FC: 1.0, DT: 1.0 },
            { label: "Rain", probability: 0.15, FC: 0.85, DT: 1.15 },
            { label: "Sunny", probability: 0.6, FC: 1.1, DT: 0.95 },
            { label: "Snow", probability: 0, FC: 0.7, DT: 1.2 },
            { label: "Heatwave", probability: 0.02, FC: 0.9, DT: 1.15 }
        ];
    }

    generateWeather(month) {
        // month: 0 = Jan, 11 = Dec

        let events = [
            { ...this.baseEvents[0], probability: 0.7 },  // Normal
            { ...this.baseEvents[1], probability: 0.1 },  // Rain
            { ...this.baseEvents[2], probability: 0.08 }, // SunnyEvent
            { ...this.baseEvents[3], probability: 0.05 }, // Snow
            { ...this.baseEvents[4], probability: 0.05 }  // Heatwave
        ];

        if ([11,0,1].includes(month)) {
            events.find(e => e.label === "Heatwave").probability = 0.15;
            events.find(e => e.label === "Snow").probability = 0;
        } else if ([5,6,7].includes(month)) {
            events.find(e => e.label === "Heatwave").probability = 0;
            events.find(e => e.label === "Snow").probability = 0.03;
        }

        // Normalise the probabilities
        const total = events.reduce((sum, event) => sum + event.probability, 0);
        events.forEach(e => e.probability / total);

        const roll = Math.random()
        let cumulative = 0;
        for (const event of events) {
            cumulative += event.probability;
            if (roll <= cumulative) {
                return { FC: event.FC, DT: event.DT, label: event.label };
            }
        }

        return { FC: 1.0, DT: 1.0, label: "Sunny" };
    }
}

module.exports = { WeatherGenerator };