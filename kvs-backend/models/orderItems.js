/**
 * Database schema for the OrderItems table
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("OrderItems", {
        amount: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }
    })
}