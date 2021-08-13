const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const encryptionKey = process.env.ENCRYPTION_32BYTE;
const signingKey = process.env.ENCRYPTION_64BYTE;

const saucesSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: {
    type: String, required: true, maxlength: 30, trim: true,
  },
  manufacturer: {
    type: String, required: true, maxlength: 30, trim: true,
  },
  description: {
    type: String, required: true, maxlength: 255, trim: true,
  },
  mainPepper: {
    type: String, required: true, maxlength: 30, trim: true,
  },
  imageUrl: { type: String },
  heat: { type: Number, required: true },
  likes: { type: Number, required: true, default: 0 },
  dislikes: { type: Number, required: true, default: 0 },
  usersLiked: { type: [String], required: true, default: [] },
  usersDisliked: { type: [String], required: true, default: [] },
});

// Encrypt and decrypt datas
saucesSchema.plugin(encrypt, { encryptionKey, signingKey, encryptedFields: ['userId', 'usersLiked', 'usersDisliked'] });

module.exports = mongoose.model('sauces', saucesSchema);
