const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Vote = require('../models/vote.model');
const Image = require('../models/image.model');
const Saved = require('../models/saved.model');

const cloudinary = require('cloudinary').v2;
const cloudConfig = require('../config/config.json').cloudinary;

module.exports = {
  deleteUserChildren,
  deletePostChildren,
};

/**
 * Handles deletion of related documents when a user or post is deleted
 * @module chain-delete
 * @requires cloudinary
 */


/**
 * Cloud provider SDK configuration
 */
cloudinary.config({
  cloud_name: cloudConfig.cloud_name,
  api_key: cloudConfig.api_key,
  api_secret: cloudConfig.api_secret,
});

/**
 * Deletes database documents (children) related to a user
 *
 * @description Children means all posts, comments,
 * likes, and saved by the user. Additionally, deletes children of children,
 * e.g. comments of a post created by the user.
 * This is to avoid orphaned database documents (e.g. children without parent).
 *
 * @param {string} userId - UserId of user that was deleted,
 * this is the initial parent
 *
 * @return {Promise<{comments: *,
 * saves: *, posts: *, likes: *}>} - Returns database response about deletion
 */
async function deleteUserChildren(userId) {
  const postsByUser = await Post.findManyByUser(userId).select('_id');
  const postIds = postsByUser.map((e) => e._id);
  await Promise.all(postIds.map(async (postId) => {
    await deletePostChildren(postId);
  }),
  );
  await cloudinary.uploader.destroy(userId, function(result) {
    console.log(result);
  });
  return {
    saves: await Saved.deleteByUser(userId),
    posts: await Post.deleteByUser(userId),
    comments: await Comment.deleteByUser(userId),
    likes: await Vote.deleteByUser(userId),
  };
}

async function deleteImagesByPost(postId) {
  let images = await Image.getImageByPost(postId);
  if (await Image.exists({post: postId})) {
    await Image.deleteByPost(postId);
    images = images.map((e) => ((e.name.split('/')[7]).replace('.png', '')));
    await cloudinary.api.delete_resources(images,
        function(error, result) {
          console.log(result, error);
        });
  }
}

/**
 * Deletes all database documents (children) of a post
 * @param {string} postId - Id of post that was deleted
 * @return {Promise<{images: *,
 * comments: *, saves: *, likes: *}>} - Returns database response about deletion
 */
async function deletePostChildren(postId) {
  await deleteImagesByPost(postId);
  return {
    saves: await Saved.deleteByPost(postId),
    images: await Image.deleteByPost(postId),
    comments: await Comment.deleteByPost(postId),
    likes: await Vote.deleteByPost(postId),
  };
}
