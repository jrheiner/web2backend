const express = require('express');
const auth = require('../_helper/authJwt');
const router = new express.Router();

const userController = require('../controller/user.controller');

const multer = require('multer');
const storage = multer.memoryStorage();
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
