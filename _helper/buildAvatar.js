const jdenticon = require('jdenticon');
const fs = require('fs');
const sharp = require('sharp');

function buildAndSaveAvatar(userId, username, size = 500) {
  if (!fs.existsSync('public/avatars')) {
    fs.mkdirSync('public/avatars');
  }
  jdenticon.configure({
    padding: 0,
  });
  const avatar = jdenticon.toPng(username.toLowerCase(), size);
  fs.writeFile(`public/avatars/${userId}.png`, avatar, (err) => {
    if (err) return console.log(err);
  });
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
