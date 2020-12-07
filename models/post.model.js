const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    maxlength: 150,
    required: true,
  },
  description: {
    type: String,
    maxlength: 2000,
  },
  public: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

PostSchema.static('findManyByUser', function(userId) {
  return this.find({author: userId});
});

PostSchema.static('deleteByUser', function(userId) {
  return this.deleteMany({author: userId});
});

module.exports = mongoose.model('Post', PostSchema);
