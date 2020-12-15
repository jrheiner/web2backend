const jdenticon = require('jdenticon');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const cloudConfig = require('../config/config.json').cloudinary;

cloudinary.config({
  cloud_name: cloudConfig.cloud_name,
  api_key: cloudConfig.api_key,
  api_secret: cloudConfig.api_secret,
});

function buildAndSaveAvatar(userId, username, size = 500) {
  // if (!fs.existsSync('public/avatars')) {
  //  fs.mkdirSync('public/avatars');
  // }
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

  // fs.writeFile(`public/avatars/${userId}.png`, avatar, (err) => {
  //  if (err) return console.log(err);
  // });
}

function saveCustomAvatar(userId, buffer, size=500) {
  sharp(buffer)
      .resize(size)
      .toFile(`public/avatars/${userId}.png`, (err) => {
        if (err) return console.log(err);
      });
}

module.exports = {
  buildAndSaveAvatar,
  saveCustomAvatar,
};
