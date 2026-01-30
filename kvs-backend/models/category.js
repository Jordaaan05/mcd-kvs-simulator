/**
 * Database schema for the Category table
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Category", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        sortID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    })
}