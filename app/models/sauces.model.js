const mongoose = require('mongoose');
const { URL } = require('url');
const path = require('path');

const saucesSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, required: true, default: 0 },
  dislikes: { type: Number, required: true, default: 0 },
  usersLiked: { type: [String], required: true, default: [] },
  usersDisliked: { type: [String], required: true, default: [] },
});

saucesSchema.virtual('imageLocal').get(function () {
  return `${path.dirname(require.main.filename)}${new URL(this.imageUrl).pathname}`;
});

// Serialize virtual fields
saucesSchema.set('toJSON', {
  virtuals: true,
});

module.exports = mongoose.model('sauces', saucesSchema);
