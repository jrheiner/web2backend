const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const v = require('../_helper/reqValidation');
const buildResponse = require('../_helper/buildResponse');
const jwtConfig = require('../config/config.json').jwt;
const avatar = require('../_helper/buildAvatar');
const errorMessages = require('../_helper/errorMessages');
const chainDelete = require('../_helper/chainDelete');
const mongoose = require('mongoose');
const Post = require('../models/post.model');
const Saved = require('../models/saved.model');

/**
 * Handle all user related operations on the database
 * @module controller/user
 */

module.exports = {
  register,
  login,
  check,
  findSelf,
  findOne,
  updateSelf,
  deleteSelf,
  findSaved,
  savePost,
  checkSaved,
};

/**
 * Add new user to the database,
 * build and upload the avatar based on the username
 * @param {*} req - Incoming request
 * @param {*} res - Response
 * @return {Promise<void>} - Void
 */
async function register(req, res) {
  const reqValidity = v.validateRegisterReq(req.body);
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidJson,
      stack: reqValidity.errors[0].stack,
    });
    return;
  }
  if (await User.exists({username: req.body.username})) {
    res.status(400).send({error: true, message: 'Username already exists!'});
    return;
  }
  const hash = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    hash: hash,
  });
  user.save(user).then((data) => {
    avatar.buildAndSaveAvatar(data._id, data.username).then((upload)=> {
      User.updateOne({_id: data._id},
          {avatar: upload.secure_url}, (err, res) => {
            if (err !== null) {
              console.log(err);
            }
          });
    });
    res.status(200).send(buildResponse.buildRegisterResponse(data));
  }).catch((err) => {
    console.log(err);
    res.status(500).send({error: true, message: 'Error creating new user!'});
  });
}


/**
 * Validates login request and returns session/auth token
 * @param {*} req - Incoming request
 * @param {*} res - Response
 * @return {Promise<void>} - Void
 */
async function login(req, res) {
  const reqValidity = v.validateLoginReq(req.body);
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidJson,
      stack: reqValidity.errors[0].stack,
    });
    return;
  }

  const user = await User.findOne({username: req.body.username});
  if (user && bcrypt.compareSync(req.body.password, user.hash)) {
    const token = jwt.sign({
      id: user._id,
    },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.expiresIn,
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
    });
    const data = {
      ...user.toJSON(),
      token,
    };
    res.status(200).send(buildResponse.buildLoginResponse(data));
  } else {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidLogin,
    });
  }
}


/**
 * Checks if a username already exists in the database
 * @param {*} req - Incoming request
 * @param {*} res - Response
 */
function check(req, res) {
  if (req.params.username) {
    User.exists({username: req.params.username.toString().toLowerCase()})
        .then((data) => {
          res.status(200).send({unique: !data});
        });
  }
}

/**
 * Wrapper function to get information about logged in user
 * @description Calls findOneById
 * @param {*} req - Incoming request
 * @param {*} res - Response
 */
function findSelf(req, res) {
  findOneById(req.user.id, req, res);
}


/**
 * Wrapper function to get information about any user by id
 * @description Calls findOneById
 * @param {*} req - Incoming request
 * @param {*} res - Response
 */
function findOne(req, res) {
  findOneById(req.params.id, req, res);
}


/**
 * Handle all user information requests
 * @param {string } id - User id
 * @param {*} req - Incoming request
 * @param {*} res - Response
 */
function findOneById(id, req, res) {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).send(
        {error: true, message: `${id} is not a valid user id!`},
    );
    return;
  }
  User.findById(id).then((data) => {
    if (!data) {
      res.status(404).send(
          {error: true, message: `User with id ${id} not found!`},
      );
    } else {
      buildResponse.buildUserResponse(data).then((data) => {
        res.status(200).send(data);
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send(
        {error: true, message: `Error getting user with id ${id}!`},
    );
  });
}


/**
 * Updates the logged in user based on what is included in the request body
 * @param {*} req - Incoming request
 * @param {*} res - Response
 * @return {Promise<void>}
 */
async function updateSelf(req, res) {
  const reqValidity = v.validateUpdateUserReq(req.body);
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidJson,
      stack: reqValidity.errors[0].stack,
    });
    return;
  }
  const id = req.user.id;
  const updatedUser = {};
  let usernameChanged = false;
  if (Object.prototype.hasOwnProperty.call(req.body, 'editUsername')) {
    if (await User.exists({username: req.body.editUsername})) {
      res.status(400).send({error: true, message: 'Username already exists!'});
      return;
    } else {
      updatedUser.username = req.body.editUsername;
      usernameChanged = true;
    }
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'resetAvatar') ||
    usernameChanged) {
    if (req.body.resetAvatar === 'on' || usernameChanged) {
      if (Object.prototype.hasOwnProperty.call(updatedUser, 'username')) {
        avatar.buildAndSaveAvatar(id, updatedUser.username);
      } else {
        const userInfo = await User.getUsernameById(req.user.id);
        avatar.buildAndSaveAvatar(id, userInfo.username);
      }
    }
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'editStatus')) {
    updatedUser.status = req.body.editStatus;
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'editPassword')) {
    updatedUser.hash = bcrypt.hashSync(req.body.editPassword, 10);
  }
  if (Object.keys(req.files).length !== 0) {
    updatedUser.avatar = req.files['customAvatar'][0].path;
  }
  console.log(updatedUser);
  User.findByIdAndUpdate(id, {
    $set: updatedUser,
  }, {new: true}).then((data) => {
    if (!data) {
      res.status(404).send(
          {
            error: true,
            message: `Error updating user with id ${id}! User not found!`,
          },
      );
    } else {
      buildResponse.buildUserResponse(data).then((data) => {
        res.status(200).send(data);
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send(
        {error: true, message: `Error updating user with id ${id}!`},
    );
  });
}


/**
 * Deletes user and all related child documents
 * @description For more information about child relations
 * and deletion check the module chain-delete
 *
 * @param {*} req - Incoming request
 * @param {*} res - Response
 */
function deleteSelf(req, res) {
  const id = req.user.id;
  User.findByIdAndDelete(id).then((data) => {
    if (!data) {
      res.status(404).send(
          {
            error: true,
            message: `Error deleting user with id ${id}! User not found!`,
          },
      );
    } else {
      chainDelete.deleteUserChildren(id).then((data) => {
        console.log(data);
        res.sendStatus(204);
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send(
        {
          error: true,
          message: `Error deleting user with id ${id}!`,
        },
    );
  });
}


/**
 * Returns the save list of the logged in user
 * @param {*} req - Incoming request
 * @param {*} res - Response
 */
function findSaved(req, res) {
  buildResponse.buildSavedResponse(req.user.id).then((data) => {
    res.status(200).send(data);
  });
}


/**
 * Saves a post to the save list of the logged in user
 * @param {*} req - Incoming request
 * @param {*} res - Response
 * @return {Promise<void>}
 */
async function savePost(req, res) {
  const postId = req.params.id;
  const userId = req.user.id;
  if (!await checkValidPost(postId, res)) return;
  if (await Saved.exists({user: userId, post: postId})) {
    await Saved.deleteOne({user: userId, post: postId});
    res.sendStatus(204);
  } else {
    const saved = new Saved({
      user: userId,
      post: postId,
    });
    saved.save(saved).then((data) => {
      res.status(200).send({id: data._id});
    }).catch((err) => {
      console.log(err);
      res.status(500).send({error: true, message: 'Error saving post!'});
    });
  }
}


/**
 * Checks if the logged in user is viewing a saved post
 * @param {*} req - Incoming request
 * @param {*} res - Response
 * @return {Promise<void>}
 */
async function checkSaved(req, res) {
  const postId = req.params.id;
  const userId = req.user.id;
  if (!await checkValidPost(postId, res)) return;
  if (await Saved.exists({user: userId, post: postId})) {
    res.status(200).send({saved: true});
  } else {
    res.status(200).send({saved: false});
  }
}

/**
 * Checks if a post exists by its id
 * @description Also checks if the post id is a valid mongoose id
 * @param {string} postId - Id of post
 * @param {*} res - Response
 * @return {Promise<boolean>}
 */
async function checkValidPost(postId, res) {
  if (!mongoose.isValidObjectId(postId)) {
    res.status(400).send(
        {error: true, message: `${postId} is not a valid post id!`},
    );
    return false;
  } else if (!await Post.exists({_id: postId})) {
    res.status(404).send(
        {error: true, message: `Post ${postId} not found!`},
    );
    return false;
  } else {
    return true;
  }
}
