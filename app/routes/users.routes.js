const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const log = require('simple-node-logger').createSimpleLogger(path.join(__dirname, '../../var/logs/auth_limit_reached.log'));

const router = express.Router();

const usersController = require('../controllers/users.controller');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6,
  onLimitReached: (req, res, options) => {
    log.warn({
      message: 'Authentification rate limit reached',
      request: { email: req.body.email },
      ip: req.connection.remoteAddress,
    });
  },
});

router.post('/login', loginLimiter, usersController.login);

router.post('/signup', usersController.signup);

module.exports = router;
