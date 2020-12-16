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

cloudinary.config({
  cloud_name: cloudConfig.cloud_name,
  api_key: cloudConfig.api_key,
  api_secret: cloudConfig.api_secret,
});

async function deleteUserChildren(userId) {
  const postsByUser = await Post.findManyByUser(userId).select('_id');
  const postIds = postsByUser.map((e) => e._id);

  await Promise.all(postIds.map(async (postId) => {
    await deleteImagesByPost(postId);
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
    console.log(images);
    await cloudinary.api.delete_resources(images,
        function(error, result) {
          console.log(result, error);
        });
  }
}

async function deletePostChildren(postId) {
  await deleteImagesByPost(postId);
  return {
    saves: await Saved.deleteByPost(postId),
    images: await Image.deleteByPost(postId),
    comments: await Comment.deleteByPost(postId),
    likes: await Vote.deleteByPost(postId),
  };
}
