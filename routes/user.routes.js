/** Express router providing user related routes
 * @module routers/user
 * @requires express
 */
const express = require('express');
const multer = require('multer');
const auth = require('../_helper/authJwt');
const userController = require('../controller/user.controller');

/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 * @namespace userRouter
 */
const router = new express.Router();

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


/**
 * Register route, handles register form
 * @name post/register
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} path - api/user/register
 * @param {callback} middleware - Express middleware.
 */
router.post('/register', userController.register);


/**
 * Login route, handles login form
 * @name post/register
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} path - api/user/register
 * @param {callback} middleware - Express middleware.
 */
router.post('/login', userController.login);


/**
 * Logged in userprofile route, handles user profile request
 * @name get/profile.current
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} path - api/user/
 * @param {callback} middleware - Authentication if user is logged in
 */
router.get('/', auth, userController.findSelf);


/**
 * Username check route, checks if a username is unique
 * @name get/check
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} path - api/user/check/:username
 */
router.get('/check/:username', userController.check);


/**
 * Saved list route, handles request about user save list
 * @name get/saved
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} path - api/user/saved
 * @param {callback} middleware - Authentication if user is logged in
 */
router.get('/saved', auth, userController.findSaved);


/**
 * Saved list route, handles request about user save list
 * @name get/saved.check
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} path - api/user/saved/:id
 * @param {callback} middleware - Authentication if user is logged in
 */
router.get('/saved/:id', auth, userController.checkSaved);


/**
 * Save post route, handles request to save a post
 * @name post/save
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} path - api/user/save/:id
 * @param {callback} middleware - Authentication if user is logged in
 */
router.post('/save/:id', auth, userController.savePost);


/**
 * Any userprofile route, handles user profile request
 * @name get/profile.any
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} path - api/user/:id
 */
router.get('/:id', userController.findOne);


/**
 * Edit user route, handles request from edit user form
 * @name put/edit
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} path - api/user/
 */
router.put('/', auth, upload.fields([
  {name: 'customAvatar', maxCount: 1},
]), userController.updateSelf);


/**
 * Delete user route, handles request to delete user
 * @name put/delete
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} path - api/user/
 */
router.delete('/', auth, userController.deleteSelf);

module.exports = router;
