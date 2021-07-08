const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // userId: string — identifiant unique MongoDB pour l'utilisateur qui a créé la sauce ???
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('users', userSchema);

module.exports = User;
