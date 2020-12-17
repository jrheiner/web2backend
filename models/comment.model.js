const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  parent: {
    type: mongoose.ObjectId,
    ref: 'Post',
    required: true,
  },
  author: {
    type: mongoose.ObjectId,
    ref: 'Post',
    required: true,
  },
  description: {
    type: String,
    maxlength: 500,
    required: true,
  },
}, {
  timestamps: true,
});


CommentSchema.static('findManyByUser', function(userId) {
  return this.find({author: userId});
});

CommentSchema.static('countByPost', function(postId) {
  return this.countDocuments({parent: postId});
});

CommentSchema.static('deleteByPost', function(postId) {
  return this.deleteMany({parent: postId});
});

CommentSchema.static('deleteByUser', function(userId) {
  return this.deleteMany({author: userId});
});

module.exports = mongoose.model('Comment', CommentSchema);
