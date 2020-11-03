const mongoose = require('mongoose')

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
});

module.exports = mongoose.model('User', UserSchema);
