// returns MFY sides that are ON 

const getActiveMFYSides = (mfySides) => {
    return mfySides.filter(mfySide => mfySide.status === "ON")
}

export default getActiveMFYSides;