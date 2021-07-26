const path = require('path');
const fs = require('fs');

/**
 * Upload a file from his mv function
 * Depends on express-fileupload
 * @param file
 * @param localPath
 * @returns {Promise<void>}
 */
exports.upload = async (file, localPath) => {
  if (!fs.existsSync(path.dirname(localPath))) {
    throw new Error('Unable to resolve the uploads directory');
  }

  await file.mv(localPath, (err) => {
    if (err) {
      throw err;
    }
  });
};
