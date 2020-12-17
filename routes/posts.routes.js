/** Express router providing posts related routes
 * @module routers/posts
 * @requires express
 */
const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const auth = require('../_helper/authJwt');
const postController = require('../controller/posts.controller');

/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 * @namespace postsRouter
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
    public_id: (req, file) => uuid.v4(),
  },
});
const upload = multer({storage: storage});


/**
 * Create route, handles new post form
 * @name post/posts
 * @function
 * @memberof module:routers/posts~postsRouter
 * @inner
 * @param {string} path - api/posts/
 * @param {callback} middleware - Authentication if user is logged in
 * @param {callback} middleware - Multer handles files from form data
 */
router.post('/', auth, upload.fields([
  {name: 'imageOne', maxCount: 1},
  {name: 'imageTwo', maxCount: 1},
  {name: 'imageThree', maxCount: 1},
]), postController.create);


/**
 * Get all route, handles request to get all posts
 * @name get/posts
 * @function
 * @memberof module:routers/posts~postsRouter
 * @inner
 * @param {string} path - api/posts/
 */
router.get('/', postController.findAll);


/**
 * Get one route, handles request about a specific post by post id
 * @name get/post.id
 * @function
 * @memberof module:routers/posts~postsRouter
 * @inner
 * @param {string} path - api/posts/:id
 */
router.get('/:id', postController.findOne);


/**
 * Update one route, handles request update form for a specific post
 * @name put/post.id
 * @function
 * @memberof module:routers/posts~postsRouter
 * @inner
 * @param {string} path - api/posts/:id
 * @param {callback} middleware - Authentication if user is logged in
 */
router.put('/:id', auth, postController.updateOne);


/**
 * Delete one route, handles delete request for a specific post
 * @name delete/post.id
 * @function
 * @memberof module:routers/posts~postsRouter
 * @inner
 * @param {string} path - api/posts/:id
 * @param {callback} middleware - Authentication if user is logged in
 */
router.delete('/:id', auth, postController.deleteOne);


/**
 * Add vote route, handles like request for a specific post
 * @name get/vote
 * @function
 * @memberof module:routers/posts~postsRouter
 * @inner
 * @param {string} path - api/posts/vote/:id
 * @param {callback} middleware - Authentication if user is logged in
 */
router.get('/:id/vote', auth, postController.addVote);


/**
 * Remove vote route, handles dislike request for a specific post
 * @name delete/vote
 * @function
 * @memberof module:routers/posts~postsRouter
 * @inner
 * @param {string} path - api/posts/vote/:id
 * @param {callback} middleware - Authentication if user is logged in
 */
router.delete('/:id/vote', auth, postController.deleteVote);

module.exports = router;
