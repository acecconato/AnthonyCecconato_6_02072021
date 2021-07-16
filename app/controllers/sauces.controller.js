const saucesModel = require('../models/sauces.model');

exports.create = (req, res) => {
  res.status(201).json({ message: 'Created' });
};

exports.findAll = (req, res) => {
  res.json({ message: 'findAll' });
};
