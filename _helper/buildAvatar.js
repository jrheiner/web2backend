const jdenticon = require('jdenticon');
const cloudinary = require('cloudinary').v2;
const cloudConfig = require('../config/config.json').cloudinary;

/**
 * Generates and uploads user avatars
 * @module build-avatar
 * @requires jdenticon
 * @requires cloudinary
 */

/**
 * Cloud provider SDK configuration
 */
cloudinary.config({
  cloud_name: cloudConfig.cloud_name,
  api_key: cloudConfig.api_key,
  api_secret: cloudConfig.api_secret,
});

/**
 * Generates a new user avatar
 * based on the username as seed and uploads it to the cloud provider
 * @param {string} userId - Id of the user, used as filename
 * @param {string} username - Username of the user, used as seed
 * @param {number} size - Avatar size (size = width = height)
 * @return {Promise<string>} - Result of the cloud provider upload
 */
function buildAndSaveAvatar(userId, username, size = 500) {
  jdenticon.configure({
    padding: 0,
  });
  const options = {
    format: 'png',
    overwrite: true,
    public_id: userId,
  };
  const avatar = jdenticon.toPng(username.toLowerCase(), size);
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options,
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        },
    ).end(avatar);
  });
}

module.exports = {
  buildAndSaveAvatar,
};
