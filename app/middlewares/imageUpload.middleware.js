const fileType = require('file-type');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

const ALLOWED = ['image/jpg', 'image/jpeg', 'image/png'];
const UPLOAD_PATH = path.join(__dirname, '..', '..', 'public', 'uploads');

/**
 * Middleware to handle image upload and verify the real mime type by checking the file buffer
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
module.exports = async (req, res, next) => {
  if (req.files && req.files.image) {
    const { image } = req.files;
    const mimeType = await fileType.fromBuffer(image.data);

    /* Firstly verify the mime type from the filename (this is not guaranteeing the real mime type) */
    if (!image.mimetype || !ALLOWED.includes(image.mimetype)) {
      return res.status(415).json('Unallowed file type');
    }

    /* Then verify the REAL file mime type by checking his buffer. We use the buffer and not a temp file
   * because in this case we don't need to hold big files, so the memory can handle it */
    if (!mimeType || !ALLOWED.includes(mimeType.mime)) {
      return res.status(415).json('Unallowed file type');
    }

    /* Upload the image */
    const localFilePath = path.join(UPLOAD_PATH, `${uuid.v4()}.${mimeType.ext}`);

    if (!fs.existsSync(UPLOAD_PATH)) {
      return res.status(500).json('Unable to resolve the uploads directory');
    }

    await image.mv(localFilePath, (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      return next();
    });
  } else {
    return next();
  }
};
