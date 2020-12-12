const fs = require('fs');
const Image = require('../models/image.model');

function saveImageFromPost(postId, b64image) {
  if (!fs.existsSync('public/assets')) {
    fs.mkdirSync('public/assets');
  }
  if (b64image.includes('data:image')) {
    console.log('safety check');
  }
  b64image = b64image.replace(/^data:image\/\w+;base64,/, '');
  const image = new Image({
    post: postId,
  });
  image.save(image).then((data) => {
    if (!fs.existsSync(`public/assets/${postId}`)) {
      fs.mkdirSync(`public/assets/${postId}`);
    }
    const imgBuffer = Buffer.from(b64image, 'base64');
    console.log(imgBuffer);
    fs.writeFile(`public/assets/${postId}/${data._id}.png`,
        imgBuffer,
        function(err) {
          if (!err) {
            console.log('Image saved to disk '+data._id);
          }
        });
  }).catch((err) => console.log(err));
}


module.exports = {saveImageFromPost};

