// store.js

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Store", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        currentBusinessDay: {
            type: DataTypes.STRING
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' }
        }
    })
} 