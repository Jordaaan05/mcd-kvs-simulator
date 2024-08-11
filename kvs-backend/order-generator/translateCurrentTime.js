/* 
    Gathers the system time and translates it into either "Breakfast", "Lunch", "Dinner", "Overnight"
*/

const translateCurrentTime = (currentSettings) => {
    const now = new Date()
    const currentHour = now.getHours()
    let time = {}

    if (currentHour < 5 || currentHour >= 23) {
        time = { time: currentHour, textTime: "Overnight" }
    } else if (currentHour >= 5 && currentHour < 11) {
        time = { time: currentHour, textTime: "Breakfast" }
    } else if (currentHour >= 11 && currentHour <= 16) {
        time = { time: currentHour, textTime: "Lunch" }
    } else if (now.getDate() === 5) {
        time = { time: currentHour, textTime: "Friday Night"}
    } else {
        time = { time: currentHour, textTime: "Dinner" }
    }

    const dayOfWeek = now.getDay()
    time = { ...time, weekday: dayOfWeek }

    return time
}

module.exports = {
    translateCurrentTime
}