const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const argon2 = require('argon2');
const encrypt = require('mongoose-encryption');

const encryptionKey = process.env.ENCRYPTION_32BYTE;
const signingKey = process.env.ENCRYPTION_64BYTE;

const { validateEmail, isPasswordInDataBreaches, isStrongPassword } = require('../services/validator');

const usersSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: validateEmail,
    lowercase: true,
    trim: true,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 64,
    trim: true,
    validate: [
      { validator: isPasswordInDataBreaches, message: 'Password is listed in data breaches, you must change it' },
      { validator: isStrongPassword, message: 'Password is too weak' },
    ],
  },
});

// Create a virtual field (which is not saved in the database)
usersSchema.virtual('userId').get(() => this._id);

// Serialize virtual fields
usersSchema.set('toJSON', {
  virtuals: true,
});

// Hash the password before saving it
usersSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await argon2.hash(this.password);
  }

  next();
});

/**
 * Add a user's method to check if a password match
 * @param plainPassword
 * @returns {Promise<boolean>}
 */
usersSchema.methods.comparePassword = async function (plainPassword) {
  return argon2.verify(this.password, plainPassword);
};

// Prettier error message on unique error
usersSchema.plugin(uniqueValidator);

// Encrypt and decrypt datas
usersSchema.plugin(encrypt, { encryptionKey, signingKey });

module.exports = mongoose.model('users', usersSchema);
