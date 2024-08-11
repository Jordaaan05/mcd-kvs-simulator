/* 
    Selects an item from a given category, weighted by price.
*/

const weightedSelectByCategory = (items, category, size, breakfastMenu) => {
    const categoryItems = items.filter(item => item.Categories.some(cat => cat.name === category)) // fuck you
    if (categoryItems.length === 0) {
        console.error(`Category ${category} does not exist/has no assigned items.`)
    }

    return weightedSelect(categoryItems, size, breakfastMenu)
}

const weightedSelect = (items, size, breakfastMenu) => {
    // for if breakfast menu is in use, note using boolean on an attribute as this allows for reg menu ordering at breakfast time.
    if (breakfastMenu && category === "Sides") {
        if (size === "Small" || size === "Medium") {
            const hashBrownItem = items.find(item => item.name === "Hash Brown");
            if (hashBrownItem) return hashBrownItem;
        } else if (size === "Large") {
            const twoHashBrownItem = items.find(item => item.name === "2 Hash Brown");
            if (twoHashBrownItem) return twoHashBrownItem;
        }
    }

    const filteredItems = size ? items.filter(item => item.name.includes(size)) : items

    if (filteredItems.length === 0) {
        console.error(`No items match the size: ${size}`)
        return null
    }

    const totalWeight = filteredItems.reduce((acc, item) => acc + 1 / item.price, 0)
    let random = Math.random() * totalWeight

    if (!size) {
        for (const item of filteredItems) {
            random -= 1 / item.price
            if (random <= 0) {
                return item
            }
        } 
    } 

    return filteredItems[filteredItems.length - 1]
}

module.exports = weightedSelectByCategory