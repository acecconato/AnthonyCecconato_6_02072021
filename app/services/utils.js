const jwt = require('jsonwebtoken');

/**
 * Generate a json web token for the desired user
 * @param user
 * @returns {*}
 */
exports.generateToken = (user) => jwt.sign({ email: user.email, _id: user._id, userId: user._id }, process.env.SECRET, {
  expiresIn: 86400,
});

/**
 * Generate image url
 * @param req
 * @param image
 * @returns {string}
 */
exports.generateImageUrl = (image) => `${process.env.UPLOAD_DIR}/${image.name}`;
