const v = require('../_helper/reqValidation');
const errorMessages = require('../_helper/errorMessages');
const buildResponse = require('../_helper/buildResponse');
const Image = require('../models/image.model');
const Post = require('../models/post.model');
const Vote = require('../models/vote.model');
const mongoose = require('mongoose');
const chainDelete = require('../_helper/chainDelete');

module.exports = {
  create,
  findAll,
  findOne,
  updateOne,
  deleteOne,
  addVote,
  deleteVote,
};

function create(req, res) {
  const reqValidity = v.validatePostReq(req.body);
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidJson,
      stack: reqValidity.errors[0].stack,
    });
    return;
  }
  let post;
  if (Object.prototype.hasOwnProperty.call(req.body, 'link')) {
    post = new Post({
      author: req.user.id,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      link: req.body.link,
    });
  } else {
    post = new Post({
      author: req.user.id,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
    });
  }
  post.save(post).then((data) => {
    res.status(200).send({id: data._id, title: data.title});
    for (const img of Object.entries(req.files)) {
      const image = new Image({
        name: img[1][0].path,
        post: data._id,
      });
      image.save(image).then((data) => {
        console.log(data);
      }).catch((err) => {
        console.log(err);
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send({error: true, message: 'Error creating new post!'});
  });
}

function findAll(req, res) {
  Post.find({}).then((data) => {
    buildResponse.buildPostResponseMultiple(data).then((data) => {
      res.status(200).send(data);
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).send({error: true, message: 'Error getting all posts!'});
  });
}

function findOne(req, res) {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).send(
        {
          error: true, message: `${id} is not a valid post id!`,
        },
    );
    return;
  }
  Post.findById(id).then((data) => {
    if (!data) {
      res.status(404).send(
          {
            error: true, message: `Post with id ${id} not found!`,
          },
      );
    } else {
      buildResponse.buildPostResponse(data).then((data) => {
        res.status(200).send(data);
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send(
        {
          error: true, message: `Error getting post with id ${id}!`,
        },
    );
  });
}

async function checkPrivileges(userId, postId, res) {
  if (mongoose.isValidObjectId(postId)) {
    const postToEdit = await Post.findById(postId);
    if (!postToEdit) {
      res.status(404).send(
          {
            error: true, message: `Post with id ${postId} not found!`,
          },
      );
      return false;
    } else if (postToEdit.author.toString() === userId.toString()) {
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
          error: true, message: `${postId} is an invalid post id!`,
        },
    );
  }
}

async function updateOne(req, res) {
  const reqValidity = v.validatePostReq(req.body);
  if (!reqValidity.valid) {
    res.status(400).send({
      error: true,
      message: errorMessages.invalidJson,
      stack: reqValidity.errors[0].stack,
    });
    return;
  }
  const userId = req.user.id;
  const postId = req.params.id;
  if (!await checkPrivileges(userId, postId, res)) {
    return;
  }
  Post.findByIdAndUpdate(postId, req.body, {new: true}).then((data) => {
    if (!data) {
      res.status(404).send(
          {
            error: true, message: `Error updating post with id ${postId}!`,
          },
      );
    } else {
      buildResponse.buildPostResponse(data).then((data) => {
        res.status(200).send(data);
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send(
        {
          error: true, message: `Error updating post with id ${postId}!`,
        },
    );
  });
}

async function deleteOne(req, res) {
  const userId = req.user.id;
  const postId = req.params.id;
  if (!await checkPrivileges(userId, postId, res)) {
    return;
  }
  Post.findByIdAndDelete(postId).then((data) => {
    if (!data) {
      res.status(404).send(
          {
            error: true,
            message: `Error deleting post with id ${postId}! Post not found!`,
          },
      );
    } else {
      chainDelete.deletePostChildren(postId).then((data) => {
        console.log(data);
        res.sendStatus(204);
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send(
        {
          error: true, message: `Error deleting post with id ${postId}!`,
        },
    );
  });
}

async function addVote(req, res) {
  const userId = req.user.id;
  const postId = req.params.id;
  if (!mongoose.isValidObjectId(postId)) {
    res.status(404).send(
        {
          error: true, message: 'Invalid post id!',
        },
    );
    return;
  }
  if (await Vote.exists({user: userId, post: postId})) {
    res.status(200).send(
        {
          success: false,
          message: 'User has already liked this post!',
          time: Math.floor(new Date().getTime() / 1000),
        },
    );
    return;
  }
  const vote = new Vote({
    user: userId,
    post: postId,
  });
  vote.save(vote).then(() => {
    res.status(200).send({
      success: true,
      time: Math.floor(new Date().getTime() / 1000),
    },
    );
  }).catch((err) => {
    console.log(err);
    res.status(500).send({error: true, message: 'Error liking post!'});
  });
}

function deleteVote(req, res) {
  const userId = req.user.id;
  const postId = req.params.id;
  if (!mongoose.isValidObjectId(postId)) {
    res.status(404).send(
        {
          error: true, message: 'Invalid post id!',
        },
    );
    return;
  }

  Vote.deletePair(userId, postId).then((data) => {
    console.log(data);
    res.sendStatus(204);
  }).catch((err) => {
    console.log(err);
    res.status(500).send(
        {
          error: true, message: `Error deleting like for post ${postId}!`,
        },
    );
  });
}
