const Sauces = require('../models/sauces.model');
const { upload, replace, removeFromRelativePath } = require('../services/fileUpload');
const { generateImageUrl } = require('../services/utils');

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
    heat: sauceObject.heat,
  });

  upload(image)
    .then((uploadedImage) => {
      newSauce.imageUrl = generateImageUrl(uploadedImage);
      newSauce.save().then((savedSauce) => res.status(201).json({ message: `Sauce ${savedSauce._id} created` }));
    })
    .catch((error) => res.status(500).json(error));
};

/**
 * Find a sauce by its ID then update it
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.update = (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-zA-Z]+$/)) {
    return next();
  }

  const sauceObject = (req.files && req.files.image) ? { ...JSON.parse(req.body.sauce) } : req.body;
  const image = (req.files && req.files.image) ? req.files.image : undefined;

  if (!sauceObject) {
    return res.status(422).send();
  }

  Sauces.findById(req.params.id)

    .then(async (sauce) => {
      sauce.name = sauceObject.name;
      sauce.manufacturer = sauceObject.manufacturer;
      sauce.description = sauceObject.description;
      sauce.mainPepper = sauceObject.mainPepper;
      sauce.heat = sauceObject.heat;

      try {
        if (image) {
          await replace(sauce.imageUrl, image);
          sauce.imageUrl = generateImageUrl(image);
        }

        await sauce.save();
        return res.status(204).json({ message: `Sauce ${id} updated` });
      } catch (error) {
        return res.status(500).json(error);
      }
    })

    .catch((error) => res.status(404).json(error));
};

/**
 * Get all sauces available
 * Also generate the image web path from the imageUrl field
 * @param req
 * @param res
 */
exports.getAll = (req, res) => {
  Sauces.find()
    .then((sauces) => {
      sauces.map((sauce) => sauce.imageUrl = `${req.protocol}://${req.headers.host}${sauce.imageUrl}`);
      return res.json(sauces);
    })
    .catch((error) => res.status(400).json(error));
};

/**
 * Get a sauce by its id
 * Also generate the image web path from the imageUrl field
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getOneById = (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-zA-Z]+$/)) {
    return next();
  }

  Sauces.findById(id)
    .then((sauce) => {
      sauce.imageUrl = `${req.protocol}://${req.headers.host}${sauce.imageUrl}`;
      res.json(sauce);
    })
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
          (sauce.usersLiked.includes(userId)) ? sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1) : null;
          (sauce.usersDisliked.indexOf(userId) === -1) ? sauce.usersDisliked.push(userId) : null;
          sauce.dislikes += 1;
          break;

        // UNLIKE / UNDISLIKE
        case USER_CANCELED:
          // If the sauce was liked
          if (sauce.usersLiked.includes(userId)) {
            sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
            sauce.likes -= 1;
          }

          // If the sauce was disliked
          if (sauce.usersDisliked.includes(userId)) {
            sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
            sauce.dislikes -= 1;
          }
          break;

        // LIKE
        case USER_LIKED:
          (sauce.usersDisliked.includes(userId)) ? sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1) : null;
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

/**
 * Remove a sauce from the database, and remove its attached image from the storage
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.delete = (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-zA-Z]+$/)) {
    return next();
  }

  Sauces.findById(id)
    .then(async (sauce) => {
      try {
        await removeFromRelativePath(sauce.imageUrl);
        await Sauces.deleteOne({ _id: id });
        res.status(200).json({ message: `Sauce ${id} deleted` });
      } catch (e) {
        return res.status(500).send();
      }
    })

    .catch(() => res.status(404).send());
};
