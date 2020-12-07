const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Vote = require('../models/vote.model');

module.exports = {
  deleteUserChildren,
  deletePostChildren,
};

async function deleteUserChildren(userId) {
  return {
    posts: await Post.deleteByUser(userId),
    comments: await Comment.deleteByUser(userId),
    likes: await Vote.deleteByUser(userId),
  };
}

async function deletePostChildren(postId) {
  return {
    comments: await Comment.deleteByPost(postId),
    likes: await Vote.deleteByPost(postId),
  };
}
