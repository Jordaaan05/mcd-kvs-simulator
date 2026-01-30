/**
 * Database model for the store settings.
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Settings", {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        name: DataTypes.STRING,
        value: DataTypes.STRING,
        StoreId: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
    });
}