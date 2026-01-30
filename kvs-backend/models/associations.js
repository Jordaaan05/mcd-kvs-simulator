/**
 * Database schema for table relations
 */

module.exports = ({
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
}) => {
    User.hasMany(Store);
    Store.belongsTo(User);

    Store.hasMany(Order);
    Order.belongsTo(Store);

    Store.hasMany(Stations)
    Stations.belongsTo(Store);

    Store.hasMany(Settings);
    Settings.belongsTo(Store);

    Store.hasMany(CustomerCount);
    CustomerCount.belongsTo(Store);

    Order.belongsToMany(Item, { through: OrderItems });
    Item.belongsToMany(Order, { through: OrderItems});

    Item.belongsToMany(Category, { through: ItemCategory });
    Category.belongsToMany(Item, { through: ItemCategory });
}