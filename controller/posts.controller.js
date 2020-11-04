const Post = require('../models/post.model')

const commentController = require('./comments.controller')

// TODO remove error messages from http response

module.exports = {
  create,
  findAll,
  findOne,
  updateOne,
  deleteOne,
  deleteByUser
}

function create (req, res) {
  if (!req.body.title) {
    res.status(400).send({ error: true, message: 'Body can not be empty!' })
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
    res.status(500).send({ error: true, message: `Error creating new post! ${err}` })
  })
}

function findAll (req, res) {
  Post.find({}).then(data => {
    res.status(200).send(data)
  }).catch(err => {
    res.status(500).send({ error: true, message: `Error getting all posts! ${err}` })
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
    res.status(500).send({ error: true, message: `Error getting post with id ${id}! ${err}` })
  })
}

async function updateOne (req, res) {
  const userId = req.user.id
  const postId = req.params.id

  if (!req.body.author && !req.body.title) {
    res.status(400).send({ error: true, message: 'Body can not be empty!' })
  }

  const postToEdit = await Post.findById(postId)

  if (postToEdit.author.toString() !== userId.toString()) {
    res.status(401).send({ error: true, message: 'Only the author can update this post!' })
    return
  }

  Post.findByIdAndUpdate(postId, req.body, { new: true }).then(data => {
    if (!data) {
      res.status(404).send({ error: true, message: `Error updating post with id ${postId}! Post not found!` })
    } else {
      res.status(200).send(data)
    }
  }).catch(err => {
    res.status(500).send({ error: true, message: `Error updating post with id ${postId}! ${err}` })
  })
}

async function deleteOne (req, res) {
  const userId = req.user.id
  const postId = req.params.id

  const postToEdit = await Post.findById(postId)

  if (postToEdit.author.toString() !== userId.toString()) {
    res.status(401).send({ error: true, message: 'Only the author can delete this post!' })
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
    res.status(500).send({ error: true, message: `Error deleting post with id ${postId}! ${err}` })
  })
}

// TODO error handling and response for mass deleting
async function deleteByUser (userId) {
  Post.deleteMany({ author: userId }).then(data => {
    commentController.deleteByUser(userId).then(() => {
      console.log('delete comments: ' + data)
    })
    console.log('delete posts: ' + data)
  }).catch(err => {
    console.log(err)
  })
}
