const express = require('express');
const multer = require('multer');
const auth = require('../_helper/authJwt');
const router = new express.Router();
const userController = require('../controller/user.controller');

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
    public_id: (req, file) => req.user.id,
  },
});

const upload = multer({storage: storage});

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/', auth, userController.findSelf);
router.get('/check/:username', userController.check);
router.get('/saved', auth, userController.findSaved);
router.get('/saved/:id', auth, userController.checkSaved);
router.post('/save/:id', auth, userController.savePost);
router.get('/:id', userController.findOne);
router.put('/', auth, upload.fields([
  {name: 'customAvatar', maxCount: 1},
]), userController.updateSelf);
router.delete('/', auth, userController.deleteSelf);

module.exports = router;
