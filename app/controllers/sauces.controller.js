const Sauces = require('../models/sauces.model');
const { upload } = require('../services/fileUpload');

const USER_LIKED = 1;
const USER_DISLIKED = -1;
const USER_CANCELED = 0;

/**
 * Create a new sauce
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.create = async (req, res) => {
  const { sauce } = req.body;
  const { image } = req.files || {};

  if (!sauce || !image) {
    return res.status(422).json('`sauce` or `image` key is missing');
  }

  let sauceObject;

  try {
    sauceObject = JSON.parse(sauce);
  } catch (e) {
    return res.status(400).json('Unable to parse `sauce` key. Is the JSON valid?');
  }

  const newSauce = new Sauces({
    userId: req.user._id,
    name: sauceObject.name,
    manufacturer: sauceObject.manufacturer,
    description: sauceObject.description,
    mainPepper: sauceObject.mainPepper,
    imageUrl: `${req.protocol}://${req.get('host')}/public/uploads/${image.name}`,
    heat: sauceObject.heat,
  });

  newSauce.save()
    .then((savedSauce) => {
      upload(image, image.path).catch((err) => res.status(500).json(err));
      return res.status(201).json({ message: `Sauce ${savedSauce._id} created` });
    })
    .catch((error) => res.status(400).send(error));
};

/**
 * Get all sauces available
 * @param req
 * @param res
 */
exports.findAll = (req, res) => {
  Sauces.find()
    .then((sauces) => res.json(sauces))
    .catch((error) => res.status(400).json(error));
};

/**
 * Get a sauce by its id
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.findOneById = (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-zA-Z]+$/)) {
    return next();
  }

  Sauces.findById(id)
    .then((sauce) => res.json(sauce))
    .catch((error) => res.status(404).json(error));
};

/**
 * Increase, decrease or cancel a like/dislike
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.handleLike = (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-zA-Z]+$/)) {
    return next();
  }

  // Get the sauce then update the likes / dislikes
  Sauces.findById(id)
    .then((sauce) => {
      const { userId, like } = req.body;

      if (!userId || like === undefined) {
        return res.status(422).send();
      }

      switch (parseInt(like)) {
        // DISLIKE
        case USER_DISLIKED:
          (sauce.usersLiked.includes(userId)) ? delete sauce.usersLiked[userId] : null;
          (sauce.usersDisliked.indexOf(userId) === -1) ? sauce.usersDisliked.push(userId) : null;
          sauce.dislikes += 1;
          break;

        // UNLIKE / UNDISLIKE
        case USER_CANCELED:
          // If the sauce was liked
          if (sauce.usersLiked.includes(userId)) {
            sauce.usersLiked = delete sauce.usersLiked[userId];
            sauce.likes -= 1;
          }

          // If the sauce was disliked
          if (sauce.usersDisliked.includes(userId)) {
            sauce.usersDisliked = delete sauce.usersDisliked[userId];
            sauce.dislikes -= 1;
          }
          break;

        // LIKE
        case USER_LIKED:
          (sauce.usersDisliked.includes(userId)) ? delete sauce.usersDisliked[userId] : null;
          (sauce.usersLiked.indexOf(userId) === -1) ? sauce.usersLiked.push(userId) : null;
          sauce.likes += 1;
          break;

        default:
          return next();
      }

      sauce.save()
        .then(() => res.status(204).send())
        .catch((error) => res.status(500).json(error));
    })
    .catch((error) => res.status(404).json(error));
};
