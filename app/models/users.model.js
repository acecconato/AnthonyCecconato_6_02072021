const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create a virtual field (which is not saved in the database)
usersSchema.virtual('userId').get(() => this._id);

// Serialize virtual fields
usersSchema.set('toJSON', {
  virtuals: true,
});

module.exports = mongoose.model('users', usersSchema);
