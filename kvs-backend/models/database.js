/** 
 * Primary file for the database schema.
 */

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
    dialect: "sqlite", // TODO: change to MySQL / MariaDB in future
    storage: "./database.sqlite",
    logging: false,
})

const User = require("./user")(sequelize, DataTypes);
const Store = require("./store")(sequelize, DataTypes);
const Order = require("./order")(sequelize, DataTypes);
const Item = require("./items")(sequelize, DataTypes);
const Category = require("./category")(sequelize, DataTypes);
const OrderItems = require("./orderItems")(sequelize, DataTypes);
const ItemCategory = require("./itemCategory")(sequelize, DataTypes);
const Stations = require("./stations")(sequelize, DataTypes);
const Settings = require("./settings")(sequelize, DataTypes);
const CustomerCount = require("./customerCount")(sequelize, DataTypes);

require("./associations")({
    User,
    Store,
    Order,
    Item,
    Category,
    OrderItems,
    ItemCategory,
    Stations,
    Settings,
    CustomerCount,
});

sequelize.sync();

module.exports = {
    sequelize,
    User,
    Store,
    Order,
    Item,
    Category,
    OrderItems,
    ItemCategory,
    Stations,
    Settings,
    CustomerCount,
};