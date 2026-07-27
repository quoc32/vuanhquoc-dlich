const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'QTravel API',
    description: 'API documentation for QTravel backend',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  basePath: '',
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Nhập token theo định dạng: Bearer <token>',
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const outputFile = './swagger_output.json';
const routes = ['./src/index.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
