// Load vendor dependencies
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const bearerToken = require('express-bearer-token');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

// Load .env configuration
require('dotenv').config();

// Load project dependencies
const progress = require('./app/services/progress').start();
const db = require('./app/config/db.config');

// Define variables
const HOST = process.env.APP_HOST || '0.0.0.0';
const PORT = process.env.APP_PORT || 3000;

// Load express
const app = express();

// Helmet for default security
app.use(helmet());

// Serve static files
app.use(process.env.PUBLIC_DIR, express.static('public'));

// Define baseDir global variable
app.use((req, res, next) => {
  process.env.baseDir = `${req.protocol}://${req.headers.host}`;
  process.env.apiBaseDir = `${process.env.baseDir}${process.env.API_URL}`;
  next();
});

// Load CORS
app.use(cors({
  origin: process.env.CLIENT_ENDPOINT,
}));

// Start the application once the database connexion is open
db.once('open', () => {
  progress.succeed('Database connexion success');

  app.listen(PORT, HOST, () => {
    progress.succeed(`The application is running on ${HOST}:${PORT}`);
    progress.info(`Environment: ${process.env.NODE_ENV}`);
  });
});

// Handle database errors
db.on('error', (error) => {
  progress.fail(`Database connexion error: ${error}`);
  process.exit(1);
});

// Output and log HTTP requests
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: fs.createWriteStream(path.join(__dirname, 'var/access.log'), { flags: 'a' }),
  }));
} else if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Get request body's parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Load files from requests
app.use(fileUpload({
  limits: { fileSize: 1e+6 }, // 1MB
  safeFileNames: true,
  abortOnLimit: true,
}));

// Create a req.token key if a Bearer token is detected
app.use(bearerToken());

// Load all routes
app.use(process.env.API_URL, require('./app/routes'));

// Returns a 404 response for all unregistered routes
app.all('*', (req, res) => {
  res.status(404).json('Resource not found');
});
