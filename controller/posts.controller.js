const v = require('../_helper/reqValidation')
const errorMessages = require('../_helper/errorMessages')
const commentController = require('./comments.controller')
const Post = require('../models/post.model')
const mongoose = require('mongoose')

module.exports = {
  create,
  findAll,
  findOne,
  updateOne,
  deleteOne,
  deleteByUser
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
    res.status(200).send(data)
  }).catch(err => {
    console.log(err)
    res.status(500).send({ error: true, message: 'Error getting all posts!' })
  })
}

function findOne (req, res) {
  const id = req.params.id
  Post.findById(id).then(data => {
    if (!data) {
      res.status(404).send({ error: true, message: `Post with id ${id} not found!` })
    } else {
      res.status(200).send(data)
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
    } else if (postToEdit.author.toString() !== userId.toString()) {
      res.status(401).send({ error: true, message: errorMessages.invalidPrivileges })
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
      res.status(200).send(data)
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
      commentController.deleteByPost(postId).then(() => {
        res.status(204).send({})
      })
    }
  }).catch(err => {
    console.log(err)
    res.status(500).send({ error: true, message: `Error deleting post with id ${postId}!` })
  })
}

// TODO error handling and response for mass deleting
async function deleteByUser (userId) {
  Post.deleteMany({ author: userId }).then(() => {
    commentController.deleteByUser(userId).then(() => {})
  }).catch(err => { console.log(err) })
}
