const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');

const progress = require('./app/services/progress').start();
const db = require('./app/config/db.config');

/* Load global variables from .env */
require('dotenv').config();

/* Load variables from .env */
const HOST = process.env.API_HOST || '0.0.0.0';
const PORT = process.env.API_PORT || 3000;

/* Load Express */
const app = express();

/* Database connexion */
db.connect()
  .then(() => {
    progress.succeed('Database connexion success');

    /* Start the application */
    app.listen(PORT, HOST, () => {
      progress.succeed(`The application is running on ${HOST}:${PORT}`);
      progress.info(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    progress.fail(`Database connexion error: ${error}`);
    process.exit(1);
  });

/* Log HTTP request inside the console */
app.use(morgan('tiny'));

/* Get request body's parameters */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* Load routes */
app.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Returns a 404 response for all unregistered routes
app.all('/*', (req, res) => {
  res.status(404).json({ message: 'Resource not found.' });
});
