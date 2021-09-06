const express = require('express');
const slowDown = require('express-slow-down');

const router = express.Router();

const authRoutes = require('./auth.routes');
const saucesRoutes = require('./sauces.routes');
const gdprRoutes = require('./gdpr.routes');
const usersRoutes = require('./users.route');

const authMiddleware = require('../middlewares/auth.middleware');

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15mns
  delayAfter: 100,
  delayMs: 500, // 500ms
});

router.use('/auth', speedLimiter, authRoutes);
router.use('/sauces', speedLimiter, authMiddleware, saucesRoutes);
router.use('/gdpr', speedLimiter, authMiddleware, gdprRoutes);
router.use('/users', speedLimiter, authMiddleware, usersRoutes);

module.exports = router;
