const Sauces = require('../models/sauces.model');

exports.create = (req, res) => {
  res.status(201).json({ message: 'Created' });
};

/**
 * Get all sauces available
 * @param req
 * @param res
 */
exports.findAll = (req, res) => {
  Sauces.find()
    .then((sauces) => res.json(sauces))
    .catch((error) => res.status(400).json(error));
};

/**
 * Get a sauce by its id
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.findOneById = (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-zA-Z]+$/)) {
    return next();
  }

  Sauces.findById(id)
    .then((sauce) => res.json(sauce))
    .catch((error) => res.status(404).json(error));
};
