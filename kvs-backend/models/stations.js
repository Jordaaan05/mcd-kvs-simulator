/*
    Database model for the Stations table
*/

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Stations", {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        name: DataTypes.STRING,
        status: DataTypes.STRING,
        group: DataTypes.STRING,
        displayName: DataTypes.STRING,
        StoreId: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
    })
}