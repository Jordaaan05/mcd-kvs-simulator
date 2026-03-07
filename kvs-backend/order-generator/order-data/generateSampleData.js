const fs = require('fs')
const path = require('path')

const SAMPLE_DATA_PATH = path.join(__dirname, 'sampleData.json')

const generateSampleData = () => {
    const data = {}

    const baseFront = 20;
    const baseDrive = 25;

    const fcHourCurve = [
        0.2,0.2,0.2,0.2,0.3,0.5,0.7,1.0,
        1.4,1.6,1.8,2.0,2.1,2.0,1.6,1.4,
        1.3,1.5,1.7,1.6,1.3,1.0,0.6,0.3
    ]

    const dtHourCurve = [
        0.3,0.3,0.3,0.3,0.4,0.7,1.0,1.3,
        1.5,1.6,1.7,1.8,1.8,1.7,1.5,1.4,
        1.5,1.7,1.9,2.0,1.7,1.4,1.0,0.7
    ]

    const weekdayCurve = [
        1.3, // Sunday
        0.85,
        0.95,
        1.0,
        1.05,
        1.1,
        1.35 // Saturday
    ]

    const fridayNightBoost = [
        1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,
        1.1,1.35,1.4,1.3,1.2,1.15,1.1,1
    ]

    const sundayNightDrop = [
        1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,
        0.95,0.9,0.8,0.7,0.6,0.6,0.6,0.6
    ]


    for (let month = 0; month < 12; month++) {
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {

                let front = baseFront;
                let drive = baseDrive

                front *= fcHourCurve[hour];
                drive *= dtHourCurve[hour];

                front *= weekdayCurve[day];
                drive *= weekdayCurve[day];

                if (day === 5) {
                    front *= fridayNightBoost[hour];
                    drive *= fridayNightBoost[hour];
                }

                if (day === 0) {
                    front *= sundayNightDrop[hour];
                    drive *= sundayNightDrop[hour];
                }

                const season =
                    1 + 0.2 * Math.sin((month / 12) * Math.PI * 2)

                front *= season
                drive *= season

                const key = `${month}-${day}-${hour}`

                data[key] = {
                    FC: Math.round(front),
                    DT: Math.round(drive)
                }
            }
        }
    }

    return data
}

const saveSampleDataToFile = () => {
    const data = generateSampleData()
    const wrapped = {
        generatedAt: new Date().toISOString(),
        data
    }

    fs.writeFileSync(SAMPLE_DATA_PATH, JSON.stringify(wrapped, null, 2), 'utf-8')
}

const loadSampleData = () => {
    if (fs.existsSync(SAMPLE_DATA_PATH)) {
        return JSON.parse(fs.readFileSync(SAMPLE_DATA_PATH, 'utf-8'))
    } else {
        const data = generateSampleData()
        saveSampleDataToFile(data)
        return { generatedAt: new Date().toISOString(), data }
    }
}

module.exports = { saveSampleDataToFile, loadSampleData }