const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    parent: {
        type: mongoose.ObjectId,
        ref: 'Post',
        required: true
    },
    author: {
        type: mongoose.ObjectId,
        ref: 'Post',
        required: true
    },
    description: {
        type: String,
        maxlength: 500,
        required: true
    },
    score: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', CommentSchema);
