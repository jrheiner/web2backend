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

VoteSchema.static('findManyByUser', function(userId) {
  return this.find({user: userId});
});

VoteSchema.static('deleteByUser', function(userId) {
  return this.deleteMany({user: userId});
});

VoteSchema.static('deletePair', function(userId, postId) {
  return this.deleteOne({user: userId, post: postId});
});

module.exports = mongoose.model('Vote', VoteSchema);
