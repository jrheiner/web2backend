const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  post: {
    type: mongoose.ObjectId,
    ref: 'Post',
    required: true,
  },
}, {
  timestamps: true,
});

ImageSchema.static('getImageByPost', function(postId) {
  return this.find({post: postId}, '_id');
});

module.exports = mongoose.model('Image', ImageSchema);
