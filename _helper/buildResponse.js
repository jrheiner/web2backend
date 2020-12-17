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

/** Functions add or strip information to an existing data object.
 * @module build-response
 * @requires dayjs
 */


/**
 * Collects additional information about a post and crafts a json response
 * @param {Object} data - Initial post data returned by the database request
 * @param {boolean} authorInfo - Determines if information
 * about the author of a post should be included
 *
 * @return {Promise<{images: undefined, author: *, link: undefined,
 * description, title, type, commentCount: *,
 * createdAtUnix: number, score: *, createdAt: string,
 * updatedAtUnix: number, id, updatedAt: string}>} - Returns response
 * object after all database calls are finished
 */
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
  const commentCount = await Comment.countByPost(data._id);

  return {
    id: data._id,
    author: author,
    title: data.title,
    description: data.description,
    score: score,
    commentCount: commentCount,
    type: type,
    link: link,
    images: images,
    createdAt: dayjs(createdAt).fromNow(),
    updatedAt: dayjs(updatedAt).fromNow(),
    createdAtUnix: dayjs(createdAt).unix(),
    updatedAtUnix: dayjs(updatedAt).unix(),
  };
}

/**
 * Wrapper function for buildPostResponse, to handle multiple posts
 * @param {Array} data - Array of post data returned by the database
 * @param {boolean} authorInfo - Determines if information about the author
 * of a post should be included
 * @return {Promise<*>} - Returns array of response data
 */
async function buildPostResponseMultiple(data, authorInfo = true) {
  const response = [];
  for (const post of data) {
    response.push(await buildPostResponse(post, authorInfo));
  }
  return response;
}

/**
 * Collects additional information about a comment and crafts a json response
 * @param {Object} data - Initial comment data returned from the database
 * @param {boolean} authorInfo - Whether information about the
 * comment author should be included
 *
 * @return {Promise<{createdAtUnix: number, parent, createdAt: string,
 * updatedAtUnix: number, author: *, description, id, updatedAt: string}>}
 * - Returns response json
 */
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
    createdAtUnix: dayjs(createdAt).unix(),
    updatedAtUnix: dayjs(updatedAt).unix(),
  };
}

/**
 * Wrapper function for buildCommentResponse,
 * to transform an array of comment data
 *
 * @param {Array} data - Array of initial comment data
 * @param {boolean} authorInfo - authorInfo - Whether information about the
 * comment author should be included
 * @return {Promise<*>} - Returns response array
 */
async function buildCommentResponseMultiple(data, authorInfo = true) {
  const response = [];
  for (const comment of data) {
    response.push(await buildCommentResponse(comment, authorInfo));
  }
  return response;
}


/**
 * Collect additional information about a user, based on initial user data
 * @param {Object} data - Initial user data
 * @return {Promise<*>} - Response json
 */
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

/**
 * Strips unneeded and critical data (password hash)
 * from the login request response
 *
 * @param {Object} data - Initial request response
 * @return {{id, username, token}} - Response json,
 * including username, user id and session/auth token
 */
function buildLoginResponse(data) {
  return {
    id: data._id,
    username: data.username,
    token: data.token,
  };
}

/**
 * Strips unneeded and critical data from the register request response
 * @param {Object} data - Initial request response
 * @return {{id, username}} - Response json, including only username and user id
 */
function buildRegisterResponse(data) {
  return {
    id: data._id,
    username: data.username,
  };
}

/**
 * Builds the user save list response
 * @param {string} userId - Id of user to build save list
 * @return {Promise<*>} - Returns user save list as array
 */
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

/**
 * Collects information about a post for the user save list
 * @param {string} id - Post id to collection information about
 * @return {Promise<{createdAtUnix: number,
 * createdAt: string, updatedAtUnix: number,
 * author: *, description: *, id, title: *,
 * updatedAt: string}>} - Response json with additional post information
 */
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
