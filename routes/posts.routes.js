const express = require('express');
const auth = require('../_helper/authJwt');
const router = new express.Router();

const postController = require('../controller/posts.controller');

const uuid = require('uuid');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/assets');
  },
  filename: function(req, file, cb) {
    cb(null, uuid.v4() + '.png');
  },
});
const upload = multer({storage: storage});

router.post('/', auth, upload.fields([
  {name: 'imageOne', maxCount: 1},
  {name: 'imageTwo', maxCount: 1},
  {name: 'imageThree', maxCount: 1},
]), postController.create);
router.get('/', postController.findAll);
router.get('/:id', postController.findOne);
router.put('/:id', auth, postController.updateOne);
router.delete('/:id', auth, postController.deleteOne);
router.get('/:id/vote', auth, postController.addVote);
router.delete('/:id/vote', auth, postController.deleteVote);

module.exports = router;
