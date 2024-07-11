const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./database'); // Adjust the path as per your project structure
const ordersRouter = require('./routes/orders'); // Adjust the path as per your project structure
const optionsRouter = require('./routes/options')
const categoriesRouter = require('./routes/categories')
const stationsRouter = require('./routes/stations')
const storeRouter = require('./routes/store')

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use orders routes
app.use('/orders', ordersRouter);
app.use('/options', optionsRouter);
app.use('/categories', categoriesRouter)
app.use('/stations', stationsRouter)
app.use('/store', storeRouter)

const PORT = process.env.PORT || 5000;

// Start server after database connection is established
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });