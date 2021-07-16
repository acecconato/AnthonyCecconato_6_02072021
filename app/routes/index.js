const express = require('express');

const router = express.Router();

const usersRoutes = require('./users.routes');
const saucesRoutes = require('./sauces.routes');

router.use('/users', usersRoutes);
router.use('/sauces', saucesRoutes);

module.exports = router;
