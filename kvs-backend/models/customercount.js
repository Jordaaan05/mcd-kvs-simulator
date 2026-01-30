/**
 * Database model for storing CustomerCount
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("CustomerCount", {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        intervalStart: DataTypes.DATE,
        intervalEnd: DataTypes.DATE,
        frontCounterCount: DataTypes.INTEGER,
        driveThruCount: DataTypes.INTEGER,
        StoreId: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
    })
}