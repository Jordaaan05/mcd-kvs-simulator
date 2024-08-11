// returns CAFE sides that are ON 

const getActiveCAFESides = (cafeSides) => {
    return cafeSides.filter(cafeSide => cafeSide.status === "ON")
}

module.exports = getActiveCAFESides;