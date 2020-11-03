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

// TODO Add default user student:dhbw for testing

module.exports = mongoose.model('User', UserSchema);
