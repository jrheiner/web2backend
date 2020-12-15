const mongoose = require('mongoose');
const User = require('../models/user.model');
const Post = require('../models/post.model');
const Vote = require('../models/vote.model');
const Image = require('../models/image.model');
const Comment = require('../models/comment.model');
const async = require('async');

module.exports = function projectStats(req, res) {
  async.parallel({
    db: function(callback) {
      mongoose.connection.db.stats((err, data) => {
        const stats = {
          storageSize: data.storageSize,
        };
        callback(null, stats);
      });
    },
    user: function(callback) {
      User.collection.stats((err, data) => {
        const stats = {
          count: data.count,
        };
        callback(null, stats);
      });
    },
    post: function(callback) {
      Post.collection.stats((err, data) => {
        const stats = {
          count: data.count,
        };
        callback(null, stats);
      });
    },
    comment: function(callback) {
      Comment.collection.stats((err, data) => {
        const stats = {
          count: data.count,
        };
        callback(null, stats);
      });
    },
    vote: function(callback) {
      Vote.collection.stats((err, data) => {
        const stats = {
          count: data.count,
        };
        callback(null, stats);
      });
    },
    image: function(callback) {
      Image.collection.stats((err, data) => {
        const stats = {
          count: data.count,
        };
        callback(null, stats);
      });
    },
  }, function(err, results) {
    res.send(err || results);
  });
};


