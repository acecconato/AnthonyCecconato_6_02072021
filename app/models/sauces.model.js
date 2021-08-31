const mongoose = require('mongoose');

const saucesSchema = new mongoose.Schema({
  userId: {
    type: String, required: true,
  },

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

  imageUrl: {
    type: String,
  },

  heat: {
    type: Number, trim: true, required: true,
  },

  likes: {
    type: Number, trim: true, required: true, default: 0,
  },

  dislikes: {
    type: Number, trim: true, required: true, default: 0,
  },

  usersLiked: {
    type: [String], trim: true, required: true, default: [],
  },

  usersDisliked: {
    type: [String], trim: true, required: true, default: [],
  },

  report: {
    type: Number, trim: true, default: 0,
  },
});

module.exports = mongoose.model('sauces', saucesSchema);
