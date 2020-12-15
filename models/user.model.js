const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 2,
    maxlength: 16,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/500',
  },
}, {
  timestamps: true,
});

UserSchema.static('getUsernameById', function(userId) {
  return this.findById(userId, 'username');
});

UserSchema.static('updateAvatarUrl', function(userId, avatarUrl) {
  return this.update({_id: userId}, {$set: {avatar: avatarUrl}});
});

UserSchema.static('getUserAndAvatarById', function(userId) {
  return this.findById(userId, 'username avatar');
});

module.exports = mongoose.model('User', UserSchema);
