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
}, {
  timestamps: true,
});

UserSchema.static('getUsernameById', function(userId) {
  return this.findById(userId, 'username');
});

module.exports = mongoose.model('User', UserSchema);
