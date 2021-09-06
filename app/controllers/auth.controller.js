const sanitize = require('mongo-sanitize');
const { ObjectId } = require('mongoose').Types;

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
    .catch((error) => res.status(422).json(error));
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

/**
 * Report a user
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.userReport = async (req, res, next) => {
  const id = sanitize(req.params.id);

  if (!id || !ObjectId.isValid(id)) {
    return next();
  }

  const user = await Users.findById(id).catch((e) => res.status(500).json(e));

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.report = user.report += 1;

  await user.save().catch((e) => res.status(500).json(e));

  res.status(200).json({ message: 'User has been reported' });
};
