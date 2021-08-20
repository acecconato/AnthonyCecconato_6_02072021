const jwt = require('jsonwebtoken');
const { LocalStorage } = require('node-localstorage');

/**
 * Check if the json web token is valid then add the user in the request object
 * @param req
 * @param res
 * @param next
 */
module.exports = (req, res, next) => {
  if (!req.token) {
    return res.status(401).json('Authentication failed');
  }

  jwt.verify(req.token, process.env.SECRET, (error, user) => {
    if (error) {
      return res.status(403).json(error);
    }

    const localStorage = new LocalStorage('./var/storage/blacklisted_jwt');
    if (localStorage[user._id] && localStorage.getItem(user._id) === req.token) {
      return res.status(403).json({ message: 'The token is blacklisted' });
    }

    req.user = user;
    next();
  });
};
