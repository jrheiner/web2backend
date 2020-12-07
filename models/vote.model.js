const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
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

VoteSchema.static('getVoteCountUser', function(userId) {
  return this.countDocuments({user: userId});
});

VoteSchema.static('getVoteCountPost', function(postId) {
  return this.countDocuments({post: postId});
});

VoteSchema.static('deleteByUser', function(userId) {
  return this.deleteMany({user: userId});
});

VoteSchema.static('deleteByPost', function(postId) {
  return this.deleteMany({post: postId});
});

VoteSchema.static('deletePair', function(userId, postId) {
  return this.deleteOne({user: userId, post: postId});
});

module.exports = mongoose.model('Vote', VoteSchema);
