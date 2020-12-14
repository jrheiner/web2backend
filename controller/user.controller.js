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

module.exports = {
  register,
  login,
  check,
  findSelf,
  findOne,
  updateSelf,
  deleteSelf,
};

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
    avatar.buildAndSaveAvatar(data._id, data.username);
    res.status(200).send(buildResponse.buildRegisterResponse(data));
  }).catch((err) => {
    console.log(err);
    res.status(500).send({error: true, message: 'Error creating new user!'});
  });
}

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

function check(req, res) {
  if (req.params.username) {
    User.exists({username: req.params.username.toString().toLowerCase()})
        .then((data) => {
          res.status(200).send({unique: !data});
        });
  }
}

function findSelf(req, res) {
  findOneById(req.user.id, req, res);
}

function findOne(req, res) {
  findOneById(req.params.id, req, res);
}

function findOneById(id, req, res) {
  if (!mongoose.isValidObjectId(id)) {
    res.status(404).send(
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
  if (Object.prototype.hasOwnProperty.call(req.body, 'username')) {
    if (await User.exists({username: req.body.username})) {
      res.status(400).send({error: true, message: 'Username already exists!'});
      return;
    }
    updatedUser.username = req.body.username;
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    updatedUser.status = req.body.status;
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'password')) {
    updatedUser.hash = bcrypt.hashSync(req.body.password, 10);
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
      res.status(200).send(data);
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send(
        {error: true, message: `Error updating user with id ${id}!`},
    );
  });
}

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
