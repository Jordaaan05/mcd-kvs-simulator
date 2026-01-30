// order.js

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Order", {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true },
        orderNumber: DataTypes.STRING,
        location: DataTypes.STRING,
        status: { 
            type: DataTypes.STRING, 
            defaultValue: "pending" 
        },
        mfySide: { 
            type: DataTypes.STRING, 
            defaultValue: "1" 
        },
        FCSide: { 
            type: DataTypes.STRING, 
            defaultValue: "1" 
        },
        served: DataTypes.JSON,
        registerNumber: { 
            type: DataTypes.STRING, 
            defaultValue: "R1" 
        },
        sendToKVS: { 
            type: DataTypes.JSON, 
            allowNull: false 
        },
        parked: { 
            type: DataTypes.BOOLEAN, 
            defaultValue: false 
        },
        orderLocation: DataTypes.STRING,
        eatInTakeOut: DataTypes.STRING,
        businessDay: DataTypes.STRING,

        StoreId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    })
}