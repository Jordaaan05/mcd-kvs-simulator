/**
 * Database schema for the ItemCategory table
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("ItemCategory", {}, {
        indexes: [
            {
                unique: true,
                fields: ['ItemId', 'CategoryId']
            }
        ]
    });
}