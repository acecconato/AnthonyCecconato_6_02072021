const express = require('express');
const routesVersioning = require('express-routes-versioning')();

const router = express.Router();

const usersController = require('../controllers/users.controller');

router.get('/', routesVersioning({
  '1.0': usersController.findAll,
}));

router.post('/', routesVersioning({
  '1.0': usersController.create,
}));

module.exports = router;
