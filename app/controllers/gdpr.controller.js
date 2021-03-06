const halson = require('halson');
const sanitize = require('mongo-sanitize');
const { Parser } = require('json2csv');
const { LocalStorage } = require('node-localstorage');

const Users = require('../models/users.model');

/**
 * Get the current user datas then export them in a CSV format with the proper headers
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.exportMyData = async (req, res) => {
  const currentUser = await Users.findOne({ _id: req.user._id }).catch((e) => res.status(500).json(e));

  if (!currentUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const json2csv = new Parser();
  const csv = json2csv.parse({ email: currentUser._doc.email });

  const filename = `${currentUser._id}_${(new Date().toJSON().slice(0, 10))}.csv`;

  res.header('Content-Type', 'text/csv');
  res.attachment(filename);

  res.send(csv);
};

/**
 * Delete a user account
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.deleteMyAccount = async (req, res) => {
  const deletedUser = await Users.findOneAndDelete({ _id: req.user._id }).catch(() => res.status(500).send());

  if (!deletedUser) {
    return res.status(404).send();
  }

  const localStorage = new LocalStorage('./var/storage/blacklisted_jwt');
  localStorage.setItem(deletedUser._id, req.token);

  return res.status(204).send();
};

/**
 * Update a user password
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.updateMyPassword = async (req, res) => {
  const user = await Users.findById(req.user._id).catch((e) => res.status(500).json(e));

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const oldPassword = sanitize(req.body.old_password);
  const newPassword = sanitize(req.body.new_password);

  if (!oldPassword || !newPassword) {
    return res.status(422).send();
  }

  if (!await user.comparePassword(oldPassword)) {
    return res.status(401).json({ error: 'The old password is invalid' });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({ error: 'Passwords are identicals' });
  }

  user.password = newPassword;

  const saveResult = await user.save().catch((e) => res.status(422).json(e));

  const savedUser = halson(saveResult._doc)
    .addLink('update-my-password', { method: 'PUT', href: `${process.env.apiBaseDir}/gdpr/update-my-password` })
    .addLink('export-my-data', { method: 'GET', href: `${process.env.apiBaseDir}/gdpr/export-my-data` })
    .addLink('delete-my-account', { method: 'DELETE', href: `${process.env.apiBaseDir}/gdpr/delete-my-account` });

  delete savedUser.password;

  return res.status(200).json({ message: 'Password updated', savedUser });
};
