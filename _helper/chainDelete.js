const Post = require('../models/post.model')
const Comment = require('../models/comment.model')

// TODO test new chain delete functions

module.exports = {
  deleteUserChildren,
  deletePostChildren
}

async function deleteUserChildren (userId) {
  return {
    posts: await Post.deleteByUser(userId),
    comments: await Comment.deleteByUser(userId)
  }
}

async function deletePostChildren (postId) {
  return await Comment.deleteByPost(postId)
}
