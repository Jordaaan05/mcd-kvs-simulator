/**
 * Database model for the Items table
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Item", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          name: DataTypes.STRING,
          price: DataTypes.FLOAT,
          display: DataTypes.STRING,
    })
}