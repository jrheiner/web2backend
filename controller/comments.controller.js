const Comment = require('../models/comment.model');

// TODO remove error messages from http response

exports.create = (req, res) => {
    if (!req.body.parent && !req.body.author && !req.body.description) {
        res.status(400).send({error: true, message: "Body can not be empty!"})
    }

    const comment = new Comment({
        parent: req.body.parent,
        author: req.body.author,
        description: req.body.description,
        score: 0
    });

    comment.save(comment).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        res.status(500).send({error: true, message: `Error creating new comment! ${err}`});
    });
};

exports.findAll = (req, res) => {
    const id = req.params.id;
    Comment.find({parent: id}).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        res.status(500).send({error: true, message: `Error getting comment for post ${id}! ${err}`});
    });
};

exports.findOne = (req, res) => {
    const id = req.params.id;
    Comment.findById(id).then(data => {
        if (!data) {
            res.status(404).send({error: true, message: `Comment with id ${id} not found`})
        } else {
            res.status(200).send(data);
        }
    }).catch(err => {
        res.status(500).send({error: true, message: `Error getting comment with id ${id}! ${err}`});
    });
};

exports.updateOne = (req, res) => {
    const id = req.params.id;

    if (!req.body.parent && !req.body.author && !req.body.description) {
        res.status(400).send({error: true, message: "Body can not be empty!"})
    }

    Comment.findByIdAndUpdate(id, req.body, {new: true}).then(data => {
        if (!data) {
            res.status(404).send({error: true, message: `Error updating comment with id ${id}! Comment not found!`})
        } else {
            res.status(200).send(data);
        }
    }).catch(err => {
        res.status(500).send({error: true, message: `Error updating comment with id ${id}! ${err}`});
    });
};

exports.deleteOne = (req, res) => {
    const id = req.params.id;
    Comment.findByIdAndDelete(id).then(data => {
        if (!data) {
            res.status(404).send({error: true, message: `Error deleting comment with id ${id}! Comment not found!`})
        } else {
            res.status(204).send({});
        }
    }).catch(err => {
        res.status(500).send({error: true, message: `Error deleting comment with id ${id}! ${err}`});
    });
};
