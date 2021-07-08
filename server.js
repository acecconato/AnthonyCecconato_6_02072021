const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

require('dotenv').config();

const HOST = process.env.API_HOST || '0.0.0.0';
const PORT = process.env.API_PORT || 3000;

const app = express();

app.use(morgan('tiny'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Returns a 404 response for all unregistered routes
app.all('/*', (req, res) => {
  res.status(404).json({ message: 'Resource not found.' });
});

app.listen(PORT, HOST, () => {
  console.log(`API running on ${HOST}:${PORT}\nEnvironment: ${process.env.NODE_ENV}`);
});
