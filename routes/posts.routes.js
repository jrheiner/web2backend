const express = require('express');
const auth = require('../_helper/authJwt');
const router = express.Router();

const postController = require('../controller/posts.controller');

router.post('/', auth, postController.create);
router.get('/', postController.findAll);
router.get('/:id', postController.findOne);
router.put('/:id', auth, postController.updateOne);
router.delete('/:id', auth, postController.deleteOne);
router.get('/:id/vote', auth, postController.addVote);
router.delete('/:id/vote', auth, postController.deleteVote);

module.exports = router;
