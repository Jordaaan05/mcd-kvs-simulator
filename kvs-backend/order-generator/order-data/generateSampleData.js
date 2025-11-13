const fs = require('fs')
const path = require('path')

const SAMPLE_DATA_PATH = path.join(__dirname, 'sampleData.json')

const generateSampleData = () => {
    const data = {}
    const baseFront = 20;
    const baseDrive = 25;
    const rushHours = [9,10,12,13,17,18,19]
    const slowerHours = [2,3,4,5]

    for (let month = 0; month < 12; month++) {
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                let front = baseFront; 
                let drive = baseDrive

                if (rushHours.includes(hour)) {
                    front *= 2.0
                    drive *= 1.8
                } else if (slowerHours.includes(hour)) {
                    front *= 0.4;
                    drive *= 0.5
                } else {
                    front *= 1.0
                    drive *= 1.1;
                }

                if (day === 0 || day === 6) { // Sunday or Saturday
                    front *= 1.2;
                    drive *= 1.3;
                } else if (day === 1) { // Monday
                    front *= 0.9;
                    drive *= 0.95;
                }
                  
                if (month === 2 || month === 3) { // Feburary / March
                    front *= 0.85
                    drive *= 0.95
                } else if (month === 11 || (month >= 0 && month <= 1)) {
                    front *= 1.25
                    drive *= 1.2
                }

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

const saveSampleDataToFile = (data) => {
    const wrapped = {
        generatedAt: new Date().toISOString(),
        data,
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