const express = require('express');

const router = express.Router();

const usersController = require('../controllers/users.controller');

router.post('/:id/report', usersController.userReport);

module.exports = router;
