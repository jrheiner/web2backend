const jdenticon = require('jdenticon');
const fs = require('fs');

function buildAndSaveAvatar(userId, username, size = 500) {
  console.log('Building Avatar!');
  if (!fs.existsSync('public/avatars')) {
    fs.mkdirSync('public/avatars');
  }
  jdenticon.configure({
    padding: 0.025,
  });
  const avatar = jdenticon.toPng(username.toLowerCase(), size);
  fs.writeFileSync('public/avatars/'+userId+'.png', avatar);
  console.log('Avatar saved!');
}


module.exports = {buildAndSaveAvatar};
