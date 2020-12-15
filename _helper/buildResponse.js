const User = require('../models/user.model');
const Post = require('../models/post.model');
const Vote = require('../models/vote.model');
const Image = require('../models/image.model');
const Comment = require('../models/comment.model');
const Saved = require('../models/saved.model');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

module.exports = {
  buildPostResponse,
  buildPostResponseMultiple,
  buildCommentResponse,
  buildCommentResponseMultiple,
  buildUserResponse,
  buildLoginResponse,
  buildRegisterResponse,
  buildSavedResponse,
};

async function buildPostResponse(data, authorInfo = true) {
  const userId = data.author;
  const author = (authorInfo ?
    await User.getUserAndAvatarById(userId) : undefined);
  const score = await Vote.getVoteCountPost(data._id);
  const type = data.type;
  const link = data.link || undefined;
  let images;
  if (type === 'img') {
    images = await Image.getImageByPost(data._id);
    images = images.map((e) => e.name);
  } else {
    images = undefined;
  }
  const createdAt = data.createdAt;
  const updatedAt = data.updatedAt;

  return {
    id: data._id,
    author: author,
    title: data.title,
    description: data.description,
    score: score,
    type: type,
    link: link,
    images: images,
    createdAt: dayjs(createdAt).fromNow(),
    updatedAt: dayjs(updatedAt).fromNow(),
    createdAtUnix: dayjs(createdAt).unix(),
    updatedAtUnix: dayjs(updatedAt).unix(),
  };
}

async function buildPostResponseMultiple(data, authorInfo = true) {
  const response = [];
  for (const post of data) {
    response.push(await buildPostResponse(post, authorInfo));
  }
  return response;
}

async function buildCommentResponse(data, authorInfo = true) {
  const userId = data.author;
  const author = (authorInfo ?
    await User.getUserAndAvatarById(userId) : undefined);
  const createdAt = data.createdAt;
  const updatedAt = data.updatedAt;

  return {
    id: data._id,
    parent: data.parent,
    author: author,
    description: data.description,
    createdAt: dayjs(createdAt).fromNow(),
    updatedAt: dayjs(updatedAt).fromNow(),
  };
}

async function buildCommentResponseMultiple(data, authorInfo = true) {
  const response = [];
  for (const comment of data) {
    response.push(await buildCommentResponse(comment, authorInfo));
  }
  return response;
}

async function buildUserResponse(data) {
  const userId = data._id;
  const createdAt = data.createdAt;
  const postsByUser = await Post.findManyByUser(userId).select('_id');
  const postIds = postsByUser.map((e) => e._id);
  const score = await Vote.getVoteCountMultiplePost(postIds);

  const userInfo = {
    id: userId,
    username: data.username,
    score: score,
    status: data.status,
    avatar: data.avatar,
    createdAt: dayjs(createdAt).fromNow(),
  };

  const userActivity = {
    posts:
      await buildPostResponseMultiple(
          await Post.findManyByUser(userId), false),
    comments:
      await buildCommentResponseMultiple(
          await Comment.findManyByUser(userId), false),
  };

  return {
    ...userInfo,
    userActivity,
  };
}

function buildLoginResponse(data) {
  return {
    id: data._id,
    username: data.username,
    token: data.token,
  };
}

function buildRegisterResponse(data) {
  return {
    id: data._id,
    username: data.username,
  };
}

async function buildSavedResponse(userId) {
  const savedPosts = await Saved.getPostsByUser(userId);
  const response = [];
  for (const saved of savedPosts) {
    response.push(
        {
          post: await getSavedResponseItem(saved.post),
          saved: dayjs(saved.createdAt).fromNow(),
        },
    );
  }
  return response;
}

async function getSavedResponseItem(id) {
  const post = await Post.findById(id);
  const userId = post.author;
  const author = await User.getUsernameById(userId);

  return {
    id: id,
    title: post.title,
    description: post.description,
    author: author,
    createdAt: dayjs(post.createdAt).fromNow(),
    updatedAt: dayjs(post.updatedAt).fromNow(),
    createdAtUnix: dayjs(post.createdAt).unix(),
    updatedAtUnix: dayjs(post.updatedAt).unix(),
  };
}
