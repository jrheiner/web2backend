const express = require('express');
const router = new express.Router();
const uuid = require('uuid');
const multer = require('multer');
const auth = require('../_helper/authJwt');
const postController = require('../controller/posts.controller');

const cloudinary = require('cloudinary').v2;
const cloudConfig = require('../config/config.json').cloudinary;
const {CloudinaryStorage} = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: cloudConfig.cloud_name,
  api_key: cloudConfig.api_key,
  api_secret: cloudConfig.api_secret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    format: 'png',
    overwrite: true,
    public_id: (req, file) => uuid.v4(),
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
