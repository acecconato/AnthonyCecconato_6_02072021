const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const argon2 = require('argon2');
const encrypt = require('mongoose-encryption');
const validator = require('validator');

const encryptionKey = process.env.ENCRYPTION_32BYTE;
const signingKey = process.env.ENCRYPTION_64BYTE;

const { isPasswordInDataBreaches, isStrongPassword } = require('../services/validator');

const usersSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: (props) => `${props.value} is not a valid email`,
    },
    lowercase: true,
    trim: true,
    maxlength: 50,
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 255,
    trim: true,
    validate: [
      { validator: isPasswordInDataBreaches, message: 'Password is listed in data breaches, you must change it' },
      { validator: isStrongPassword, message: 'Password is too weak' },
    ],
  },

  report: {
    type: Number,
    trim: true,
    default: 0,
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
usersSchema.plugin(encrypt, { encryptionKey, signingKey, excludeFromEncryption: ['report'] });

module.exports = mongoose.model('users', usersSchema);
