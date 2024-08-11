/* 
    Uses Poisson distribution to define the number of items in an order.
*/

const numItemsPerOrder = (mean) => {
    let L = Math.exp(-mean)
    let k = 0
    let p = 1

    do {
        k++
        p *= Math.random()
    } while (p > L)

    return Math.max(k - 1, 1)
}

module.exports = numItemsPerOrder