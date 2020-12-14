const mongoose = require('mongoose');

const SavedSchema = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    ref: 'User',
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

SavedSchema.static('getPostsByUser', function(userId) {
  return this.find({user: userId}, 'post createdAt');
});

SavedSchema.static('deleteByPost', function(postId) {
  return this.deleteMany({post: postId});
});

SavedSchema.static('deleteByUser', function(userId) {
  return this.deleteMany({user: userId});
});


module.exports = mongoose.model('Saved', SavedSchema, 'saved');
