// returns FC sides that are ON

const getActiveFCSides = (fcSides) => {
    return fcSides.filter(fcSide => fcSide.status === "ON")
}

module.exports = getActiveFCSides;