const Users = require('../models/users.model');
const processMongooseError = require('../services/processMongooseError');

exports.create = (req, res) => {
  const newUser = new Users(req.body);
  newUser.save()
    .then((data) => {
      res.status(201).json({ message: `User ${data._id} created` });
    })
    .catch((error) => {
      processMongooseError(error, res);
    });
};

exports.findAll = (req, res) => {
  Users.find()
    .then((data) => {
      res.json({ data });
    }).catch((error) => {
      processMongooseError(error, res);
    });
};
