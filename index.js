const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Import routes
const usersRoutes = require('./apis/users');
const itemsRoutes = require('./apis/items');
const ordersRoutes = require('./apis/orders');
const orderItemsRoutes = require('./apis/order_items');
const ratingsRoutes = require('./apis/ratings');
const userOrdersRoutes = require('./apis/user_orders');

// Use routes
app.use('/api/users', usersRoutes);
app.use('/api/users', userOrdersRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/order_items', orderItemsRoutes);
app.use('/api/ratings', ratingsRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.send('AlloyDB API is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
