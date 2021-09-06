const sanitize = require('mongo-sanitize');
const { ObjectId } = require('mongoose').Types;

const Users = require('../models/users.model');

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

  if (req.user._id === id) {
    return res.status(400).json('You can\'t report yourself');
  }

  const user = await Users.findById(id).catch((e) => res.status(500).json(e));

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.report = user.report += 1;

  await user.save().catch((e) => res.status(500).json(e));

  res.status(200).json({ message: 'User has been reported' });
};
