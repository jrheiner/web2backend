const Post = require('../models/post.model');

// TODO remove error messages from http response

exports.create = (req, res) => {
    if (!req.body.author && !req.body.title) {
        res.status(400).send({error: true, message: "Body can not be empty!"})
    }

    const post = new Post({
        author: req.body.author,
        title: req.body.title,
        description: req.body.description,
        score: 0,
        public: req.body.public ? req.body.public: true
    });

    post.save(post).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        res.status(500).send({error: true, message: `Error creating new post! ${err}`});
    });
};

exports.findAll = (req, res) => {
    Post.find({}).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        res.status(500).send({error: true, message: `Error getting all posts! ${err}`});
    });
};

exports.findOne = (req, res) => {
    const id = req.params.id;
    Post.findById(id).then(data => {
        if (!data) {
            res.status(404).send({error: true, message: `Post with id ${id} not found`})
        } else {
            res.status(200).send(data);
        }
    }).catch(err => {
        res.status(500).send({error: true, message: `Error getting post with id ${id}! ${err}`});
    });
};

exports.updateOne = (req, res) => {
    const id = req.params.id;

    if (!req.body.author && !req.body.title) {
        res.status(400).send({error: true, message: "Body can not be empty!"})
    }

    Post.findByIdAndUpdate(id, req.body, {new: true}).then(data => {
        if (!data) {
            res.status(404).send({error: true, message: `Error updating post with id ${id}! Post not found!`})
        } else {
            res.status(200).send(data);
        }
    }).catch(err => {
        res.status(500).send({error: true, message: `Error updating post with id ${id}! ${err}`});
    });
};

exports.deleteOne = (req, res) => {
    const id = req.params.id;
    Post.findByIdAndDelete(id).then(data => {
        if (!data) {
            res.status(404).send({error: true, message: `Error deleting post with id ${id}! Post not found!`})
        } else {
            res.status(204).send({});
        }
    }).catch(err => {
        res.status(500).send({error: true, message: `Error deleting post with id ${id}! ${err}`});
    });
};
