const express = require('express');
const slowDown = require('express-slow-down');

const router = express.Router();

const usersRoutes = require('./users.routes');
const saucesRoutes = require('./sauces.routes');
const gdprRoutes = require('./gdpr.routes');

const authMiddleware = require('../middlewares/auth.middleware');

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15mns
  delayAfter: 100,
  delayMs: 500, // 500ms
});

router.use('/auth', speedLimiter, usersRoutes);
router.use('/sauces', speedLimiter, authMiddleware, saucesRoutes);
router.use('/gdpr', speedLimiter, authMiddleware, gdprRoutes);

module.exports = router;
