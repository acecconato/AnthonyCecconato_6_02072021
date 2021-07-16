const express = require('express');

const router = express.Router();

const usersRoutes = require('./users.routes');
const saucesRoutes = require('./sauces.routes');

const authMiddleware = require('../middlewares/auth.middleware');

router.use('/auth', usersRoutes);
router.use('/sauces', authMiddleware, saucesRoutes);

module.exports = router;
