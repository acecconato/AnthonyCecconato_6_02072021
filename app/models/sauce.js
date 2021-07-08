const mongoose = require('mongoose');

const sauceSchema = new mongoose.Schema({
  // id: ObjectID — identifiant unique créé par MongoDB ; ???
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  usersLiked: { type: [String], default: 0 },
  usersDisliked: { type: [String], default: 0 },
});

module.exports = mongoose.model('sauces', sauceSchema);
