const express = require('express');
const routesVersioning = require('express-routes-versioning')();

const router = express.Router();

const saucesController = require('../controllers/sauces.controller');

router.get('/', routesVersioning({
  '1.0': saucesController.findAll,
}));

router.post('/', routesVersioning({
  '1.0': saucesController.create,
}));

module.exports = router;
