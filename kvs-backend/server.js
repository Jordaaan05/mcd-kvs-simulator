const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./database/database');
const ordersRouter = require('./routes/orders');
const optionsRouter = require('./routes/options')
const categoriesRouter = require('./routes/categories')
const stationsRouter = require('./routes/stations')
const storeRouter = require('./routes/store')
const settingsRouter = require('./routes/settings')
const authRouter = require('./auth/authRoutes')
const { initialiseWebSocket } = require('./modules/websocket')

const { executeOrderGenerator } = require('./order-generator/executeOrderGenerator')

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use orders routes
app.use('/orders', ordersRouter);
app.use('/options', optionsRouter);
app.use('/categories', categoriesRouter)
app.use('/stations', stationsRouter)
app.use('/store', storeRouter)
app.use('/settings', settingsRouter)
app.use('/api/auth', authRouter)

const PORT = process.env.PORT;

// Start server after database connection is established
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');

    executeOrderGenerator()

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    initialiseWebSocket(server)
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });