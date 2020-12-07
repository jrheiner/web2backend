const User = require('../models/user.model');
const Post = require('../models/post.model');
const Vote = require('../models/vote.model');
const Comment = require('../models/comment.model');
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
};

// TODO validation/schema of json before sending back?
async function buildPostResponse(data, authorInfo = true) {
  const userId = data.author;
  const author = (authorInfo ? await User.getUsernameById(userId) : undefined);
  const score = await Vote.getVoteCountPost(data._id);
  const createdAt = data.createdAt;
  const updatedAt = data.updatedAt;

  return {
    id: data._id,
    author: author,
    title: data.title,
    description: data.description,
    score: score,
    createdAt: dayjs(createdAt).fromNow(),
    updatedAt: dayjs(updatedAt).fromNow(),
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
  const author = (authorInfo ? await User.getUsernameById(userId) : undefined);
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
  const score = await Vote.getVoteCountUser(userId);

  const userInfo = {
    id: userId,
    username: data.username,
    score: score,
    status: data.status,
    createdAt: dayjs(createdAt).fromNow(),
  };

  const userActivity = {
    posts: await buildPostResponseMultiple(await Post.findManyByUser(userId), false),
    comments: await buildCommentResponseMultiple(await Comment.findManyByUser(userId), false),
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
