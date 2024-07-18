// database.js

const { Sequelize, DataTypes } = require('sequelize');

// Initialize SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // SQLite database file path
  logging: false // Disable logging (you may enable it for debugging)
});

// Define models
const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNumber: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  mfySide: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1'
  },
  FCSide: {
    type: DataTypes.STRING,
    defaultValue: 1
  },
  served: {
    type: DataTypes.JSON
  },
  registerNumber: {
    type: DataTypes.STRING,
    defaultValue: 'R1'
  },
  sendToKVS: {
    type: DataTypes.JSON,
    allowNull: false
  },
  parked: {
    type: DataTypes.BOOLEAN,
    default: false
  },
  orderLocation: {
    type: DataTypes.STRING
  },
  eatInTakeOut: {
    type: DataTypes.STRING
  }
  // You can add more fields as needed
});

// Define Items model (for options like burgers, drinks, etc.)
const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  display: {
    type: DataTypes.STRING
  },
  // Add more fields as needed
});

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sortID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
})

const OrderItems = sequelize.define('OrderItems', {
  amount: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
})

const ItemCategory = sequelize.define('ItemCategory', {
  // Add any additional attributes here if needed
});

const Stations = sequelize.define('Stations', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "ON"
  },
  group: {
    type: DataTypes.STRING,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING
  }
}
)

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  currentBusinessDay: {
    type: DataTypes.STRING
  }
})

// Define relationships (if any)
Order.belongsToMany(Item, { through: OrderItems });
Item.belongsToMany(Order, { through: OrderItems });
Item.belongsToMany(Category, { through: ItemCategory})
Category.belongsToMany(Item, { through: ItemCategory });

// Synchronize models with the database (create tables if not exist)
sequelize.sync({ force: false }) // set force to true to drop and re-create tables on every server start
  .then(() => {
    console.log('Database and tables synced');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });

module.exports = {
  sequelize,
  Order,
  Item,
  Category,
  OrderItems,
  ItemCategory,
  Stations,
  Store
};
