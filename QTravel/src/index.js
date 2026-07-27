const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger_output.json');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const path = require('path');

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use('/api/v1', apiRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/', (req, res) => {
  res.send('<h1>Welcome to QTravel API</h1> <a href="/api-docs">Link to api-docs</a>');
});

// Global error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
