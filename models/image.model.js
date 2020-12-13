const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  post: {
    type: mongoose.ObjectId,
    ref: 'Post',
    required: true,
  },
}, {
  timestamps: true,
});

ImageSchema.static('getImageByPost', function(postId) {
  return this.find({post: postId}, 'name');
});

ImageSchema.static('deleteByPost', function(postId) {
  return this.deleteMany({post: postId});
});

module.exports = mongoose.model('Image', ImageSchema);
