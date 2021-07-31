const fileType = require('file-type');

const ALLOWED = ['image/jpg', 'image/jpeg', 'image/png'];

/**
 * Middleware to handle image upload and verify the real mime type by checking the file buffer
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
module.exports = async (req, res, next) => {
  if (req.files && req.files.image) {
    if (req.files.image.length > 1) {
      return res.status(415).json('You can only send one image at the same time');
    }

    const { image } = req.files;
    const mimeType = await fileType.fromBuffer(image.data).catch((err) => res.status(500).json(err));

    /* Firstly verify the mime type from the filename (this is not guaranteeing the real mime type) */
    /* Then verify the REAL file mime type by checking his buffer. We use the buffer and not a temp file
   * because in this case we don't need to hold big files, so the memory can handle it */
    if (!image.mimetype || !ALLOWED.includes(image.mimetype) || !mimeType || !ALLOWED.includes(mimeType.mime)) {
      return res.status(415).json(`Unallowed file type, you can only pass: ${ALLOWED.join(' or ')}`);
    }

    return next();
  }
  return next();
};
