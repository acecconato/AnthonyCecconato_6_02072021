const halson = require('halson');
const sanitize = require('mongo-sanitize');
const { ObjectId } = require('mongoose').Types;

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
 * @returns {Promise<*>}
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
    userId: sanitize(req.user._id),
    name: sanitize(sauceObject.name),
    manufacturer: sanitize(sauceObject.manufacturer),
    description: sanitize(sauceObject.description),
    mainPepper: sanitize(sauceObject.mainPepper),
    heat: sanitize(sauceObject.heat),
  });

  upload(image)
    .then((uploadedImage) => {
      newSauce.imageUrl = generateImageUrl(uploadedImage);
      newSauce.save()
        .then((saveResult) => {
          saveResult.imageUrl = `${process.env.baseDir}${saveResult.imageUrl}`;
          const savedSauce = halson(saveResult._doc)
            .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/sauces/${saveResult._id}` })
            .addLink('update', { method: 'PUT', href: `${process.env.apiBaseDir}/sauces/${saveResult._id}` })
            .addLink('like', { method: 'POST', href: `${process.env.apiBaseDir}/sauces/${saveResult._id}/like` })
            .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/sauces/${saveResult._id}` })
            .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/sauces/${saveResult._id}/report` });

          res.status(201).json({ message: `Sauce ${savedSauce._id} created`, savedSauce });
        }).catch((error) => res.status(422).json({ error }));
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
  const id = sanitize(req.params.id);

  if (!id || !ObjectId.isValid(id)) {
    return next();
  }

  let sauceObject;
  let image;

  try {
    sauceObject = (req.files && req.files.image) ? { ...JSON.parse(req.body.sauce) } : req.body;
    image = (req.files && req.files.image) ? req.files.image : undefined;

    if (req.body.sauce && !image) {
      throw Error();
    }

    if (Object.keys(sauceObject).length < 1 && !image) {
      throw Error('sauceObject or/and image is empty');
    }
  } catch (error) {
    return res.status(422).send();
  }

  Sauces.findById(req.params.id)

    .then(async (sauce) => {
      if (req.user._id !== sauce.userId) {
        return res.status(403).json('You are not the owner of this item');
      }

      sauce.name = sanitize(sauceObject.name);
      sauce.manufacturer = sanitize(sauceObject.manufacturer);
      sauce.description = sanitize(sauceObject.description);
      sauce.mainPepper = sanitize(sauceObject.mainPepper);
      sauce.heat = sanitize(sauceObject.heat);

      try {
        if (image) {
          await replace(sauce.imageUrl, image);
          sauce.imageUrl = generateImageUrl(image);
        }

        const saveResult = await sauce.save().catch((error) => res.status(422).json({ error }));

        const savedSauce = halson(saveResult._doc)
          .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/sauces/${saveResult._id}` })
          .addLink('update', { method: 'PUT', href: `${process.env.apiBaseDir}/sauces/${saveResult._id}` })
          .addLink('like', { method: 'POST', href: `${process.env.apiBaseDir}/sauces/${saveResult._id}/like` })
          .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/sauces/${saveResult._id}` })
          .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/sauces/${saveResult._id}/report` });

        return res.status(200).json({ message: `Sauce ${id} updated`, savedSauce });
      } catch (error) {
        return res.status(500).json(error);
      }
    }).catch((error) => res.status(404).json(error));
};

/**
 * Get all sauces available
 * Also generate the image web path from the imageUrl field
 * @param req
 * @param res
 */
exports.readAll = async (req, res) => {
  const datas = await Sauces.find().catch((e) => res.status(500).json(e));

  const sauces = datas.map((sauceDatas) => {
    const sauce = halson(sauceDatas._doc);
    sauce
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/sauces/${sauceDatas._id}` })
      .addLink('update', { method: 'PUT', href: `${process.env.apiBaseDir}/sauces/${sauceDatas._id}` })
      .addLink('like', { method: 'POST', href: `${process.env.apiBaseDir}/sauces/${sauceDatas._id}/like` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/sauces/${sauceDatas._id}` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/sauces/${sauceDatas._id}/report` });

    return {
      ...sauce,
      imageUrl: `${process.env.baseDir}${sauceDatas.imageUrl}`,
    };
  });

  return res.json(sauces);
};

/**
 * Get a sauce by its id
 * Also generate the image web path from the imageUrl field
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.readOneById = async (req, res, next) => {
  const id = sanitize(req.params.id);

  if (!id || !ObjectId.isValid(id)) {
    return next();
  }

  const sauceDatas = await Sauces.findById(id).catch((e) => res.status(500).json(e));

  if (!sauceDatas) {
    return res.status(404).json({ message: 'Sauce not found' });
  }

  const sauce = halson(sauceDatas._doc);
  sauce
    .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/sauces/${sauceDatas._id}` })
    .addLink('update', { method: 'PUT', href: `${process.env.apiBaseDir}/sauces/${sauceDatas._id}` })
    .addLink('like', { method: 'POST', href: `${process.env.apiBaseDir}/sauces/${sauceDatas._id}/like` })
    .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/sauces/${sauceDatas._id}` })
    .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/sauces/${sauceDatas._id}/report` });

  return res.json({ ...sauce, imageUrl: `${req.protocol}://${req.headers.host}${sauceDatas.imageUrl}` });
};

/**
 * Increase, decrease or cancel a like/dislike
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.handleLike = async (req, res, next) => {
  const id = sanitize(req.params.id);

  if (!id || !ObjectId.isValid(id)) {
    return next();
  }

  const sauce = await Sauces.findById(id).catch((e) => res.status(500).json(e));

  if (!sauce) {
    return res.status(404).json({ message: 'Sauce not found' });
  }

  const userId = sanitize(req.body.userId);
  const like = sanitize(req.body.like);

  if (!userId || typeof like !== 'number') {
    return res.status(422).send();
  }

  let message;
  switch (parseInt(like)) {
    // DISLIKE
    case USER_DISLIKED:

      message = `Sauce ${sauce.name} is already disliked`;

      // If the sauce was previously liked by the user
      if (sauce.usersLiked.includes(userId)) {
        sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
        sauce.likes -= 1;
      }

      // If the sauce is not already disliked by the user
      if (sauce.usersDisliked.indexOf(userId) === -1) {
        sauce.usersDisliked.push(userId);
        sauce.dislikes += 1;
        message = `Sauce ${sauce.name} disliked`;
      }

      break;

    // UNLIKE / UNDISLIKE
    case USER_CANCELED:

      message = `Sauce ${sauce.name} was not already liked or disliked`;

      // If the sauce was previously liked
      if (sauce.usersLiked.includes(userId)) {
        sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
        sauce.likes -= 1;
        message = `Sauce ${sauce.name} unliked`;
      }

      // If the sauce was previously disliked
      if (sauce.usersDisliked.includes(userId)) {
        sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
        sauce.dislikes -= 1;
        message = `Sauce ${sauce.name} undisliked`;
      }

      break;

    // LIKE
    case USER_LIKED:

      message = `Sauce ${sauce.name} is already liked`;

      // If the sauce was previously disliked by the user
      if (sauce.usersDisliked.includes(userId)) {
        sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
        sauce.dislikes -= 1;
      }

      // If the sauce is not already liked by the user
      if (sauce.usersLiked.indexOf(userId) === -1) {
        sauce.usersLiked.push(userId);
        sauce.likes += 1;
        message = `Sauce ${sauce.name} liked`;
      }

      break;

    default:
      return next();
  }

  await Sauces.updateOne({ _id: sauce._id }, {
    likes: sauce.likes,
    dislikes: sauce.dislikes,
    usersLiked: sauce.usersLiked,
    usersDisliked: sauce.usersDisliked,
  }, { runValidators: true }).catch((e) => res.status(500).json(e));

  return res.status(200).json({ message });
};

/**
 * Remove a sauce from the database, and remove its attached image from the storage
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.delete = (req, res, next) => {
  const id = sanitize(req.params.id);

  if (!id || !id.match(/^[0-9a-zA-Z]+$/)) {
    return next();
  }

  Sauces.findById(id)
    .then(async (sauce) => {
      if (req.user._id !== sauce.userId) {
        return res.status(403).json('You are not the owner of this item');
      }

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

/**
 * Report a sauce
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.sauceReport = async (req, res, next) => {
  const id = sanitize(req.params.id);

  if (!id || !ObjectId.isValid(id)) {
    return next();
  }

  const sauce = await Sauces.findById(id).catch((e) => res.status(500).json(e));

  if (!sauce) {
    return res.status(404).json({ message: 'Sauce not found' });
  }

  sauce.report = sauce.report += 1;

  await sauce.save().catch((e) => res.status(500).json(e));

  res.status(200).json({ message: 'Sauce has been reported' });
};
