/* 
    The primary order generator function. Handles gathering all items for orders, etc. 
*/

// Note that baseRate is the probability of an order being created each time the function is called.

// External imports

// Module imports
const { translateCurrentTime } = require("./translateCurrentTime")
const { calculateBaseRate } = require('./calculateBaseRate')
const routeOrder = require('../order-router/orderRouter')
const numItemsPerOrder = require('./numItemsPerOrder')
const weightedSelectByCategory = require('./weightedSelect')

// Define store characteristics, rush periods etc
const storeCharacteristics = {
    rushPeriods: {
        Breakfast: [9,10],
        Lunch: [12,13],
        Dinner: [17,18]
    },
    typicalPeriods: [7,8,15,16,20,21,22], // anything not apart of either this or the rush period, is a quiet period.
    transitionalPeriods: [11,14,19], // periods just after a rush period where its busier than typical but winding down.
    coffeeOnlyChance: {
        "weekday": 0.25,
        "weekend": 0.025
    },
    drinkOnlyChance: {
        "weekday": 0.1,
        "weekend": 0.04
    },
    avgOrderSize: {
        Breakfast: 2,
        Lunch: 2.5,
        Dinner: 3,
        Overnight: 2.5,
        "Friday Night": 3.2,
    },
    shareBoxChance: {
        Breakfast: 0,
        Lunch: 0.0625,
        Dinner: 0.25,
        Overnight: 0.125,
        "Friday Night": 0.2,
    },
}

const generateOrder = (storeId, currentSettings, currentItems, currentBusinessDay, customerLocation, clock) => {
    console.log("Executing Generate Order...")

    const time = translateCurrentTime(currentSettings) // Gets the current time in form of { time, time in text (Breakfast, Lunch....) }
    const currentHour = time.time // current hour in 24 hr time, e.g. 22 for 10 pm
    const currentDay = time.weekday // day of the week starting at 1, monday, up to 7, sunday
    let timeOfDay = time.textTime // current hour converted to the daypart, breakfast, lunch, dinner, etc.
    if (currentSettings.find(setting => setting.name === "Rush-Period").value !== "Off") {
        timeOfDay = currentSettings.find(setting => setting.name === "Rush-Period").value
    }
    let order = { items: [], businessDay: currentBusinessDay, StoreId: storeId }

    // first of all assign information about registers, timestamp
    let registerNumber
    if (currentSettings.find(setting => setting.name === "Drive-Enabled".value === "On") && currentSettings.find(setting => setting.name === "Store-Size" !== "Food Court")) {
        if (customerLocation == "DT") {
            if (Math.random() < 0.76) {
                registerNumber = 31
            } else {
                registerNumber = 32
            }
        } else {
            if (Math.random() < 0.87) {
                registerNumber = Math.floor(Math.random() * 5) + 1
            } else {
                registerNumber = Math.floor(Math.random() * 13) + 40
            }
        }
    } else {
        if (Math.random() < 0.87) {
            registerNumber = Math.floor(Math.random() * 5) + 1
        } else {
            registerNumber = Math.floor(Math.random() * 13) + 40
        }
    }
    

    order = { ...order, registerNumber: `R${registerNumber}`, timestamp: new Date(clock.now()) }

    // next if the kitchen lock setting is enabled, only generate orders with breakfast, beef, chicken items

    // then do rest as normal, if FC lock is selected, normal orders still need to be created, just needs to be routed to FC only.
    let coffeeOnly = false
    let drinkOnly = false
    if (timeOfDay === "Breakfast") {
        if (currentDay >= 1 && currentDay <= 5) {
            coffeeOnly = Math.random() < storeCharacteristics["coffeeOnlyChance"]["weekday"] // chance for an order to just be a coffee and nothing else (10%)
        } else {
            coffeeOnly = Math.random() < storeCharacteristics["coffeeOnlyChance"]["weekend"] // chance for a coffee only order on a weekend (days 6 & 7) (2.5%)
        }
    } else {
        coffeeOnly = Math.random() < 0.005
        if (currentDay >= 1 && currentDay <= 5) {
            drinkOnly = Math.random() < storeCharacteristics["drinkOnlyChance"]["weekday"] // chance for an order to just be a coffee and nothing else (10%)
        } else {
            drinkOnly = Math.random() < storeCharacteristics["drinkOnlyChance"]["weekend"] // chance for a coffee only order on a weekend (days 6 & 7) (2.5%)
        }
    }

    if (coffeeOnly === true) {
        const size = Math.random();
        const selectedSize = size < 0.2 ? "Small" : size < 0.55 ? "Medium" : "Large";
        generateCoffee(currentItems, selectedSize)
        return order
    }

    if (drinkOnly === true) {
        const size = Math.random();
        const selectedSize = size < 0.2 ? "Small" : size < 0.55 ? "Medium" : "Large";
        generateDrink(currentItems, selectedSize)
        return order
    }

    let avgOrderSize = storeCharacteristics["avgOrderSize"][timeOfDay]
    if (currentSettings.find(setting => setting.name === "Average-Order-Size").value !== "Off") {
        avgOrderSize = currentSettings.find(setting => setting.name === "Average-Order-Size")
    }

    const num_items = numItemsPerOrder(avgOrderSize)
    for (let i = 0; i < num_items; i++) {
        if (timeOfDay !== "Breakfast") {
            // normal menu rules apply
            if (Math.random() < 0.6) { // chance to make the order a combo
                let burger
                const size = Math.random() < 0.5 ? "Medium": "Large"

                if (Math.random() < 0.7) {
                    // chance for beef items
                    burger = weightedSelectByCategory(currentItems, "Beef")
                    order = {...order, items: [...order.items, { id: burger.id, name: burger.name, amount: 1 }] }
                } else {
                    // chance for chicken menu
                    burger = weightedSelectByCategory(currentItems, "Chicken")
                    order = {...order, items: [...order.items, { id: burger.id, name: burger.name, amount: 1 }] }
                }

                let drink = generateDrink(currentItems, size)
                order = {...order, items: [...order.items, { id: drink.id, name: drink.name, amount: 1 }]}

                let sides = generateSides(currentItems, size, false)
                order = {...order, items: [...order.items, { id: sides.id, name: sides.name, amount: 1}]}

            } else if (Math.random() < storeCharacteristics["shareBoxChance"][timeOfDay]) {
                // chance for a sharebox to be ordered
                const bigMacItem = currentItems.find(item => item.name === "Big Mac")
                const mcchickenItem = currentItems.find(item => item.name === "McChicken")
                const qtrItem = currentItems.find(item => item.name === "Quarter Pounder")
                const cheeseburgerItem = currentItems.find(item => item.name === "Cheeseburger")
                
                order = {...order, items: [...order.items, { id: bigMacItem.id, name: bigMacItem.name, amount: 1 }, { id: mcchickenItem.id, name: mcchickenItem.name, amount: 1 }, { id: qtrItem.id, name: qtrItem.name, amount: 1 }, { id: cheeseburgerItem.id, name: cheeseburgerItem.name, amount: 1 },]}

                const size = Math.random();
                const selectedSize = size < 0.33 ? "Small" : size < 0.66 ? "Medium" : "Large";
                for (let i = 0; i < 4; i++) {
                    let drink = generateDrink(currentItems, selectedSize)
                    order = {...order, items: [...order.items, { id: drink.id, name: drink.name, amount: 1 }]}

                    let sides = generateSides(currentItems, selectedSize, false)
                    order = {...order, items: [...order.items, { id: sides.id, name: sides.name, amount: 1}]}

                    let desert = generateDeserts(currentItems, selectedSize)
                    order = {...order, items: [...order.items, { id: desert.id, name: desert.name, amount: 1}]}
                }
            } else {
                // burger item on its own, 60% chance for it to be from the beef menu
                if (Math.random() < 0.6) {
                    // chance for beef items
                    burger = weightedSelectByCategory(currentItems, "Beef")
                    order = {...order, items: [...order.items, { id: burger.id, name: burger.name, amount: 1 }] }
                } else {
                    // chance for chicken menu
                    burger = weightedSelectByCategory(currentItems, "Chicken")
                    order = {...order, items: [...order.items, { id: burger.id, name: burger.name, amount: 1 }] }
                }
            }
        } else {
            // breakfast menu rules apply
            if (Math.random() < 0.75) { // 75% of orders will be combo
                let breakfastItem
                const size = Math.random();
                const selectedSize = size < 0.33 ? "Small" : size < 0.66 ? "Medium" : "Large";

                breakfastItem = weightedSelectByCategory(currentItems, "Breakfast")
                order = {...order, items: [...order.items, { id: breakfastItem.id, name: breakfastItem.name, amount: 1 }] }
                
                if (Math.random() < 0.2) { // 20% chance for a normal fountain drink
                    let drink = generateDrink(currentItems, selectedSize)
                    order = {...order, items: [...order.items, { id: drink.id, name: drink.name, amount: 1 }]}
                } else { // otherwise coffee
                    let drink = generateCoffee(currentItems, selectedSize)
                    order = {...order, items: [...order.items, { id: drink.id, name: drink.name, amount: 1 }]}
                }
                
                if (Math.random < 0.9) {
                    let sides = generateSides(currentItems, selectedSize, true) // will generate hashbrowns only
                    order = {...order, items: [...order.items, { id: sides.id, name: sides.name, amount: 1}]}
                } else { // for the other weird 10% who get fries at breakfast time
                    let sides = generateSides(currentItems, selectedSize, true)
                    order = {...order, items: [...order.items, { id: sides.id, name: sides.name, amount: 1}]}
                }
                
            }
        }
    }
    console.log("Generating Order...")

    routeOrder(order)
}


const generateDrink = (currentItems, size) => {
    const categoryName = "Drinks"

    drink = weightedSelectByCategory(currentItems, categoryName, size)
    return drink
}

const generateSides = (currentItems, size, breakfastMenu) => {
    const categoryName = "Sides"

    sides = weightedSelectByCategory(currentItems, categoryName, size, breakfastMenu)
    return sides 
}

const generateDeserts = (currentItems, size) => {
    const categoryName = "Deserts"

    actualSize = size === "Small" ? "Small" : size === "Medium" ? "Small" : "Large"
    desert = weightedSelectByCategory(currentItems, categoryName, actualSize)
    return desert
}

const generateCoffee = (currentItems, size) => {
    const categoryName = "McCafe"

    coffee = weightedSelectByCategory(currentItems, categoryName, size)
    return coffee
}

module.exports = { generateOrder }
