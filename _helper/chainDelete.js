const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Vote = require('../models/vote.model');
const Image = require('../models/image.model');
const Saved = require('../models/saved.model');
const fs = require('fs');

module.exports = {
  deleteUserChildren,
  deletePostChildren,
};

async function deleteUserChildren(userId) {
  const postsByUser = await Post.findManyByUser(userId).select('_id');
  const postIds = postsByUser.map((e) => e._id);

  await Promise.all(postIds.map(async (postId) => {
    let images = await Image.getImageByPost(postId);
    await Image.deleteByPost(postId);
    images = images.map((e) => e.name);
    images.forEach((name) => {
      fs.unlinkSync(`public/assets/${name}`);
    });
  }));

  fs.unlinkSync(`public/avatars/${userId}.png`);
  return {
    saves: await Saved.deleteByUser(userId),
    posts: await Post.deleteByUser(userId),
    comments: await Comment.deleteByUser(userId),
    likes: await Vote.deleteByUser(userId),
  };
}

async function deletePostChildren(postId) {
  let images = await Image.getImageByPost(postId);
  images = images.map((e) => e.name);
  images.forEach((name) => {
    fs.unlinkSync(`public/assets/${name}`);
  });
  return {
    saves: await Saved.deleteByPost(postId),
    images: await Image.deleteByPost(postId),
    comments: await Comment.deleteByPost(postId),
    likes: await Vote.deleteByPost(postId),
  };
}
