const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');

require('dotenv').config();

const progress = require('./app/services/progress').start();
const db = require('./app/config/db.config');

const HOST = process.env.APP_HOST || '0.0.0.0';
const PORT = process.env.APP_PORT || 3000;

/* Load Express */
const app = express();

/* Database connexion */
db.once('open', () => {
  progress.succeed('Database connexion success');

  app.listen(PORT, HOST, () => {
    progress.succeed(`The application is running on ${HOST}:${PORT}`);
    progress.info(`Environment: ${process.env.NODE_ENV}`);
  });
});

db.on('error', (error) => {
  progress.fail(`Database connexion error: ${error}`);
  process.exit(1);
});

/* Log HTTP request inside the console */
app.use(morgan('tiny'));

/* Get request body's parameters */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* Load routes */
app.use(process.env.API_URL, require('./app/routes'));

// Returns a 404 response for all unregistered routes
app.all('/*', (req, res) => {
  res.status(404).json({ message: 'Resource not found.' });
});
