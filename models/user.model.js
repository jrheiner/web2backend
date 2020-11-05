const mongoose = require('mongoose')

// TODO dont return hash when requesting user info

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 2,
    maxlength: 16,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  score: Number
}, {
  timestamps: true
})

UserSchema.static('getUsernameById', function (userId) {
  return this.findById(userId, 'username')
})

module.exports = mongoose.model('User', UserSchema)
