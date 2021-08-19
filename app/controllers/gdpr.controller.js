const halson = require('halson');
const sanitize = require('mongo-sanitize');

const Users = require('../models/users.model');
const Sauces = require('../models/sauces.model');

exports.exportMyData = (req, res, next) => {

};

exports.deleteMyAccount = async (req, res, next) => {
  const deletedUser = await Users.findOneAndDelete({ _id: req.user._id }).catch(() => res.status(500).send());

  if (!deletedUser) {
    return res.status(404).send();
  }

  return res.status(204).send();
};

exports.updateMyPassword = (req, res, next) => {

};

exports.userReport = (req, res, next) => {

};

exports.sauceReport = (req, res, next) => {

};
