const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// TODO remove error messages from http response

module.exports = {
    register,
    login,
    findSelf,
    updateSelf,
    deleteSelf
}

// TODO if  is sent i throws an error, only checks for empty field not non existing fields
//  { "username": "student" }
async function register(req, res) {
    if (!req.body.username && !req.body.password) {
        res.status(400).send({error: true, message: "Body can not be empty!"})
        return;
    }

    if (await User.findOne({username: req.body.username})) {
        res.status(400).send({error: true, message: "Username already exists!"})
        return;
    }

    let hash = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
        username: req.body.username,
        hash: hash,
        score: 0
    });

    user.save(user).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        res.status(500).send({error: true, message: `Error creating new user! ${err}`});
    });
}

// TODO JWT SIGNING CONFIG ETC...

async function login(req, res) {
    const user = await User.findOne({username: req.body.username});
    if (user && bcrypt.compareSync(req.body.password, user.hash)) {
        const token = jwt.sign({
                id: user._id
            },
            "jwt-dev",
            {
                expiresIn: "1d",
                audience: 'localhost',
                issuer: 'backend-dev'
            });
        let response = {
            ...user.toJSON(),
            token
        };
        res.status(200).json(response);
    } else {
        res.status(400).send({error: true, message: `Wrong password or username!`});
    }
}

 function findSelf(req, res) {
    const id = req.user.id;
    User.findById(id).then(data => {
        if (!data) {
            res.status(404).send({error: true, message: `User with id ${id} not found!`})
        } else {
            res.status(200).send(data);
        }
    }).catch(err => {
        res.status(500).send({error: true, message: `Error getting user with id ${id}! ${err}`});
    });
}

function updateSelf(req, res) {
    const id = req.user.id;

    if (!req.body.username && !req.body.password) {
        res.status(400).send({error: true, message: "Body can not be empty!"})
    }

    User.findByIdAndUpdate(id, req.body, {new: true}).then(data => {
        if (!data) {
            res.status(404).send({error: true, message: `Error updating user with id ${id}! User not found!`})
        } else {
            res.status(200).send(data);
        }
    }).catch(err => {
        res.status(500).send({error: true, message: `Error updating user with id ${id}! ${err}`});
    });
}

function deleteSelf(req, res) {
    const id = req.user.id;

    User.findByIdAndDelete(id).then(data => {
        if (!data) {
            res.status(404).send({error: true, message: `Error deleting user with id ${id}! User not found!`})
        } else {
            res.status(204).send({});
        }
    }).catch(err => {
        res.status(500).send({error: true, message: `Error deleting user with id ${id}! ${err}`});
    });
}
