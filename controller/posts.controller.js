const v = require('../_helper/reqValidation')
const errorMessages = require('../_helper/errorMessages')
const buildResponse = require('../_helper/buildResponse')
const Post = require('../models/post.model')
const mongoose = require('mongoose')
const chainDelete = require('../_helper/chainDelete')

module.exports = {
  create,
  findAll,
  findOne,
  updateOne,
  deleteOne
}

function create (req, res) {
  const reqValidity = v.validatePostReq(req.body)
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidJson,
      stack: reqValidity.errors[0].stack
    })
    return
  }
  const post = new Post({
    author: req.user.id,
    title: req.body.title,
    description: req.body.description,
    score: 0,
    public: req.body.public ? req.body.public : true
  })
  post.save(post).then(data => {
    res.status(200).send(data)
  }).catch(err => {
    console.log(err)
    res.status(500).send({ error: true, message: 'Error creating new post!' })
  })
}

function findAll (req, res) {
  Post.find({}).then(data => {
    buildResponse.buildPostResponseMultiple(data).then(data => { res.status(200).send(data) })
  }).catch(err => {
    console.log(err)
    res.status(500).send({ error: true, message: 'Error getting all posts!' })
  })
}

function findOne (req, res) {
  // TODO CHECK FOR VALID ID
  const id = req.params.id
  Post.findById(id).then(data => {
    if (!data) {
      res.status(404).send({ error: true, message: `Post with id ${id} not found!` })
    } else {
      buildResponse.buildPostResponse(data).then(data => { res.status(200).send(data) })
    }
  }).catch(err => {
    console.log(err)
    res.status(500).send({ error: true, message: `Error getting post with id ${id}!` })
  })
}

async function checkPrivileges (userId, postId, res) {
  if (mongoose.isValidObjectId(postId)) {
    const postToEdit = await Post.findById(postId)
    if (!postToEdit) {
      res.status(404).send({ error: true, message: `Post with id ${postId} not found!` })
      return false
    } else if (postToEdit.author.toString() === userId.toString()) {
      return true
    } else {
      res.status(401).send({ error: true, message: errorMessages.invalidPrivileges })
      return false
    }
  } else {
    res.status(404).send({ error: true, message: `${postId} is an invalid post id!` })
  }
}

async function updateOne (req, res) {
  const reqValidity = v.validatePostReq(req.body)
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidJson,
      stack: reqValidity.errors[0].stack
    })
    return
  }
  const userId = req.user.id
  const postId = req.params.id
  if (!await checkPrivileges(userId, postId, res)) {
    return
  }
  Post.findByIdAndUpdate(postId, req.body, { new: true }).then(data => {
    if (!data) {
      res.status(404).send({ error: true, message: `Error updating post with id ${postId}!` })
    } else {
      buildResponse.buildPostResponse(data).then(data => { res.status(200).send(data) })
    }
  }).catch(err => {
    console.log(err)
    res.status(500).send({ error: true, message: `Error updating post with id ${postId}!` })
  })
}

async function deleteOne (req, res) {
  const userId = req.user.id
  const postId = req.params.id
  if (!await checkPrivileges(userId, postId, res)) {
    return
  }
  Post.findByIdAndDelete(postId).then(data => {
    if (!data) {
      res.status(404).send({ error: true, message: `Error deleting post with id ${postId}! Post not found!` })
    } else {
      chainDelete.deletePostChildren(postId).then((data) => {
        console.log(data)
        res.sendStatus(204)
      })
    }
  }).catch(err => {
    console.log(err)
    res.status(500).send({ error: true, message: `Error deleting post with id ${postId}!` })
  })
}
