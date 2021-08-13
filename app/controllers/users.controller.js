const sanitize = require('mongo-sanitize');

const { generateToken } = require('../services/utils');
const Users = require('../models/users.model');

/**
 * Register a new user in the database
 * @param req
 * @param res
 */
exports.signup = (req, res) => {
  const user = new Users({
    email: sanitize(req.body.email),
    password: sanitize(req.body.password),
  });

  user.save()
    .then((savedUser) => res.status(201).json({ message: `User ${savedUser._id} created` }))
    .catch((error) => res.json(error));
};

/**
 * Login a user then return the userId and a json web token
 * @param req
 * @param res
 */
exports.login = (req, res) => {
  const email = (req.body.email) ? sanitize(req.body.email).toLowerCase() : undefined;
  const password = sanitize(req.body.password);

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(422).send();
  }

  Users.findOne({ email }, async (error, user) => {
    if (error) {
      return res.json(error);
    }

    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json('Authentication failed');
    }

    return res.json({
      userId: user._id,
      token: generateToken(user),
    });
  });
};

exports.readAll = (req, res) => {
  Users.find()
    .then((datas) => {
      res.json(datas);
    });
};
