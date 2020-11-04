const Comment = require('../models/comment.model')
const v = require('../_helper/reqValidation')

// TODO remove error messages from http response
// TODO deleting or updating post/comment/user that does not exit

module.exports = {
  create,
  findAll,
  findOne,
  updateOne,
  deleteOne,
  deleteByPost,
  deleteByUser
}

function create (req, res) {
  const reqValidity = v.validateCommentReq(req.body)
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      code: 4000,
      message: 'Invalid JSON request body!',
      stack: reqValidity.errors[0].stack
    })
    return
  }

  const comment = new Comment({
    parent: req.body.parent,
    author: req.user.id,
    description: req.body.description,
    score: 0
  })

  comment.save(comment).then(data => {
    res.status(200).send(data)
  }).catch(err => {
    res.status(500).send({ error: true, message: `Error creating new comment! ${err}` })
  })
}

function findAll (req, res) {
  const id = req.params.id
  Comment.find({ parent: id }).then(data => {
    res.status(200).send(data)
  }).catch(err => {
    res.status(500).send({ error: true, message: `Error getting comment for post ${id}! ${err}` })
  })
}

function findOne (req, res) {
  const id = req.params.id
  Comment.findById(id).then(data => {
    if (!data) {
      res.status(404).send({ error: true, message: `Comment with id ${id} not found` })
    } else {
      res.status(200).send(data)
    }
  }).catch(err => {
    res.status(500).send({ error: true, message: `Error getting comment with id ${id}! ${err}` })
  })
}

async function updateOne (req, res) {
  const reqValidity = v.validateCommentReq(req.body)
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      code: 4000,
      message: 'Invalid JSON request body!',
      stack: reqValidity.errors[0].stack
    })
    return
  }

  const userId = req.user.id
  const commentId = req.params.id

  if (!req.body.parent && !req.body.author && !req.body.description) {
    res.status(400).send({ error: true, message: 'Body can not be empty!' })
    return
  }

  const commentToEdit = await Comment.findById(commentId)

  if (commentToEdit.author.toString() !== userId.toString()) {
    res.status(401).send({ error: true, message: 'Only the author can update this comment!' })
    return
  }

  Comment.findByIdAndUpdate(commentId, req.body, { new: true }).then(data => {
    if (!data) {
      res.status(404).send({ error: true, message: `Error updating comment with id ${commentId}! Comment not found!` })
    } else {
      res.status(200).send(data)
    }
  }).catch(err => {
    res.status(500).send({ error: true, message: `Error updating comment with id ${commentId}! ${err}` })
  })
}

async function deleteOne (req, res) {
  const userId = req.user.id
  const commentId = req.params.id

  const commentToEdit = await Comment.findById(commentId)

  if (!commentToEdit && commentToEdit.author.toString() !== userId.toString()) {
    res.status(401).send({ error: true, message: 'Only the author can update this comment!' })
    return
  }

  Comment.findByIdAndDelete(commentId).then(data => {
    if (!data) {
      res.status(404).send({ error: true, message: `Error deleting comment with id ${commentId}! Comment not found!` })
    } else {
      res.status(204).send({})
    }
  }).catch(err => {
    res.status(500).send({ error: true, message: `Error deleting comment with id ${commentId}! ${err}` })
  })
}

// TODO error handling and response for mass deleting
async function deleteByPost (postId) {
  Comment.deleteMany({ parent: postId }).then(data => {
    console.log(data)
  }).catch(err => {
    console.log(err)
  })
}

async function deleteByUser (userId) {
  Comment.deleteMany({ author: userId }).then(data => {
    console.log(data)
  }).catch(err => {
    console.log(err)
  })
}
