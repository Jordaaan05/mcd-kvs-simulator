/* 
    Returns the current time in a 24 hour format
*/

const get24HrTime = () => {
    // may eventually call a time from a database and increment from there
    // for rush period simulations? or for "game" mode simulations?

    const now = new Date()
    let hours = now.getHours()
    let minutes = now.getMinutes()
    let seconds = now.getSeconds()

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`
}

export default get24HrTime