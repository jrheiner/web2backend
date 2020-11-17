const Post = require('../models/post.model');
const Comment = require('../models/comment.model');

module.exports = {
  deleteUserChildren,
  deletePostChildren,
};

async function deleteUserChildren(userId) {
  return {
    posts: await Post.deleteByUser(userId),
    comments: await Comment.deleteByUser(userId),
  };
}

async function deletePostChildren(postId) {
  return await Comment.deleteByPost(postId);
}
