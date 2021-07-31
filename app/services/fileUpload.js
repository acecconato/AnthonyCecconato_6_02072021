const mime = require('mime-types');
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');

/**
 * Upload a file from his mv function
 * Depends on express-fileupload
 * This function is not secure, use a validation middleware for the security
 * @param file File object (express-fileupload)
 * @returns {Promise<void>}
 */
exports.upload = async (file) => {
  const ext = mime.extension(file.mimetype);
  const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR);

  if (!fs.existsSync(uploadDir)) {
    throw new Error('Unable to resolve the uploads directory');
  }

  const generatedFilename = `${uuid.v4()}.${ext}`;
  file.path = path.join(uploadDir, generatedFilename);
  file.name = generatedFilename;

  await file.mv(file.path, (err) => {
    if (err) {
      throw err;
    }
  });

  return file;
};

/**
 * Replace a file by another one
 * Depends on express-fileupload
 * @param filePathToReplace
 * @param newFile File object (express-fileupload)
 * @returns {Promise<void>}
 */
exports.replace = async (filePathToReplace, newFile) => {
  const absoluteFilePathToReplace = path.join(__dirname, '..', '..', filePathToReplace);
  const absoluteDirPath = absoluteFilePathToReplace.replace(path.basename(absoluteFilePathToReplace), '');

  if (!fs.existsSync(absoluteFilePathToReplace)) {
    throw new Error('Unable to resolve the uploads directory');
  }

  const ext = mime.extension(newFile.mimetype);
  const generatedFilename = `${uuid.v4()}.${ext}`;
  newFile.path = path.join(absoluteDirPath, generatedFilename);
  newFile.name = generatedFilename;

  // Delete the old file
  fs.unlinkSync(absoluteFilePathToReplace);

  // Upload the new file
  await newFile.mv(newFile.path, (err) => {
    if (err) {
      throw err;
    }
  });
};

/**
 * Remove a file from its relative path
 * @param relativePath
 * @returns {Promise<boolean>}
 */
exports.removeFromRelativePath = async (relativePath) => {
  const absPath = path.join(__dirname, '..', '..', relativePath);

  if (!fs.existsSync(absPath)) {
    throw new Error('Unable to resolve the file path');
  }

  fs.unlinkSync(absPath);
  return true;
};
