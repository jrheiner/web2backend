const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const v = require('../_helper/reqValidation');
const errorMessages = require('../_helper/errorMessages');
const mongoose = require('mongoose');
const buildResponse = require('../_helper/buildResponse');

module.exports = {
  create,
  findAll,
  findOne,
  updateOne,
  deleteOne,
};

async function create(req, res) {
  const reqValidity = v.validateCommentReq(req.body);
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidJson,
      stack: reqValidity.errors[0].stack,
    });
    return;
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send(
        {error: true, message: `${req.params.id} is an invalid post id!`},
    );
    return;
  }
  if (!await Post.exists({_id: req.params.id})) {
    res.status(404).send(
        {
          error: true, message: `Post ${req.params.id} not found!`,
        },
    );
    return;
  }
  const comment = new Comment({
    parent: req.params.id,
    author: req.user.id,
    description: req.body.description,
  });
  comment.save(comment).then(() => {
    res.sendStatus(204);
  }).catch((err) => {
    console.log(err);
    res.status(500).send({error: true, message: 'Error creating new comment!'});
  });
}

function findAll(req, res) {
  const id = req.params.id;
  if (mongoose.isValidObjectId(id)) {
    Comment.find({parent: id}).then((data) => {
      buildResponse.buildCommentResponseMultiple(data).then((data) => {
        res.status(200).send(data);
      });
    }).catch((err) => {
      console.log(err);
      res.status(500).send(
          {
            error: true,
            message: `Error getting comment for post ${id}!`,
          },
      );
    });
  } else {
    res.status(400).send(
        {
          error: true,
          message: `${id} is an invalid post id!`,
        },
    );
  }
}

function findOne(req, res) {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).send(
        {
          error: true,
          message: `${id} is an invalid post id!`,
        },
    );
    return;
  }
  Comment.findById(id).then((data) => {
    if (!data) {
      res.status(404).send(
          {
            error: true,
            message: `Comment with id ${id} not found`,
          },
      );
    } else {
      buildResponse.buildCommentResponse(data).then((data) => {
        res.status(200).send(data);
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send(
        {
          error: true,
          message: `Error getting comment with id ${id}!`,
        },
    );
  });
}

async function checkPrivileges(userId, commentId, res) {
  if (mongoose.isValidObjectId(commentId)) {
    const commentToEdit = await Comment.findById(commentId);
    if (!commentToEdit) {
      res.status(404).send(
          {
            error: true, message: `Comment with id ${commentId} not found!`,
          },
      );
      return false;
    } else if (commentToEdit.author.toString() === userId.toString()) {
      return true;
    } else {
      res.status(401).send(
          {
            error: true, message: errorMessages.invalidPrivileges,
          },
      );
      return false;
    }
  } else {
    res.status(404).send(
        {
          error: true, message: `${commentId} is an invalid comment id!`,
        },
    );
  }
}

async function updateOne(req, res) {
  const reqValidity = v.validateCommentReq(req.body);
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidJson,
      stack: reqValidity.errors[0].stack,
    });
    return;
  }
  const userId = req.user.id;
  const commentId = req.params.id;
  if (!await checkPrivileges(userId, commentId, res)) {
    return;
  }
  Comment.findByIdAndUpdate(commentId, req.body, {new: true}).then((data) => {
    if (!data) {
      res.status(404)
          .send({
            error: true,
            message: `Error updating comment with id ${commentId}!
             Comment not found!`,
          });
    } else {
      buildResponse.buildCommentResponse(data).then((data) => {
        res.status(200).send({description: data.description});
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send(
        {
          error: true,
          message: `Error updating comment with id ${commentId}!`,
        },
    );
  });
}

async function deleteOne(req, res) {
  const userId = req.user.id;
  const commentId = req.params.id;
  if (!await checkPrivileges(userId, commentId, res)) {
    return;
  }
  Comment.findByIdAndDelete(commentId).then((data) => {
    if (!data) {
      res.status(404).send(
          {
            error: true,
            message: `Error deleting comment with id ${commentId}!
             Comment not found!`,
          },
      );
    } else {
      res.sendStatus(204);
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send(
        {
          error: true,
          message: `Error deleting comment with id ${commentId}!`,
        },
    );
  });
}
