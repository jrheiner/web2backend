const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const v = require('../_helper/reqValidation')
const buildResponse = require('../_helper/buildResponse')
const config = require('../config/config.json')
const errorMessages = require('../_helper/errorMessages')
const postController = require('./posts.controller')
const chainDelete = require('../_helper/chainDelete')

module.exports = {
  register,
  login,
  findSelf,
  updateSelf,
  deleteSelf
}

async function register (req, res) {
  const reqValidity = v.validateRegisterReq(req.body)
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidJson,
      stack: reqValidity.errors[0].stack
    })
    return
  }
  if (await User.findOne({ username: req.body.username })) {
    res.status(400).send({ error: true, message: 'Username already exists!' })
    return
  }
  const hash = bcrypt.hashSync(req.body.password, 10)
  const user = new User({
    username: req.body.username,
    hash: hash,
    score: 0
  })
  user.save(user).then(data => {
    res.status(200).send(data)
  }).catch(err => {
    console.log(err)
    res.status(500).send({ error: true, message: 'Error creating new user!' })
  })
}

async function login (req, res) {
  const reqValidity = v.validateLoginReq(req.body)
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidJson,
      stack: reqValidity.errors[0].stack
    })
    return
  }

  const user = await User.findOne({ username: req.body.username })
  if (user && bcrypt.compareSync(req.body.password, user.hash)) {
    const token = jwt.sign({
      id: user._id
    },
    config.jwt,
    {
      expiresIn: config.jwt_expiresIn,
      audience: config.jwt_audience,
      issuer: config.jwt_issuer
    })
    const response = {
      ...user.toJSON(),
      token
    }
    res.status(200).json(response)
  } else {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidLogin
    })
  }
}

function findSelf (req, res) {
  const id = req.user.id
  User.findById(id).then(data => {
    if (!data) {
      res.status(404).send({ error: true, message: `User with id ${id} not found!` })
    } else {
      buildResponse.buildUserResponse(data).then(data => { res.status(200).send(data) })
    }
  }).catch(err => {
    console.log(err)
    res.status(500).send({ error: true, message: `Error getting user with id ${id}!` })
  })
}

function updateSelf (req, res) {
  const reqValidity = v.validateUpdateUserReq(req.body)
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidJson,
      stack: reqValidity.errors[0].stack
    })
    return
  }
  const id = req.user.id
  User.findByIdAndUpdate(id, req.body, { new: true }).then(data => {
    if (!data) {
      res.status(404).send({ error: true, message: `Error updating user with id ${id}! User not found!` })
    } else {
      res.status(200).send(data)
    }
  }).catch(err => {
    console.log(err)
    res.status(500).send({ error: true, message: `Error updating user with id ${id}!` })
  })
}

function deleteSelf (req, res) {
  const id = req.user.id
  User.findByIdAndDelete(id).then(data => {
    if (!data) {
      res.status(404).send({ error: true, message: `Error deleting user with id ${id}! User not found!` })
    } else {
      chainDelete.deleteUserChildren(id).then((data) => {
        console.log(data)
        res.sendStatus(204)
      })
    }
  }).catch(err => {
    console.log(err)
    res.status(500).send({ error: true, message: `Error deleting user with id ${id}!` })
  })
}
