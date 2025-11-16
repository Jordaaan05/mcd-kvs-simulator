// database.js

const { Sequelize, DataTypes } = require('sequelize');
const defineUser = require('./user')

// Initialize SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // SQLite database file path
  logging: false // Disable logging (you may enable it for debugging)
});

const User = defineUser(sequelize)

// Define models
const Store = sequelize.define('Store', { // business day oopsie
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
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
})

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
  },
  businessDay: {
    type: DataTypes.STRING
  },
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
  },
  group: {
    type: DataTypes.STRING,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING
  }
})

const Settings = sequelize.define('Settings', {
  /*
    The following settings are auto-generated into this table:
    Generator-Enabled: true/false,
    Num-IPS: 1,2,3,4,
    Num-FC: 1,2,
    Store-Size: Food Court, Small, Medium, Large,
    Order-Arrival-Rate: Slow, Typical, Peak, Max

    Note that the store size setting likely would affect number of IPs and FC sides, 
    with Food Court having 1 of each, Small having 2 IPs and 1 FC, Medium having 3 or 4 IPs,
    and large being 4 IPs and 2 FC. These are still stored in the database for sake of simplicity.
  */
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

const CustomerCount = sequelize.define('CustomerCount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  intervalStart: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  intervalEnd: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  frontCounterCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  driveThruCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

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
  Store,
  Settings,
  User,
  CustomerCount
};
