/** Express router providing comments related routes
 * @module routers/comments
 * @requires express
 */
const express = require('express');
const auth = require('../_helper/authJwt');
const commentController = require('../controller/comments.controller');


/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 * @namespace commentsRouter
 */
const router = new express.Router();


/**
 * Comment creation route, handles requests from new comment form
 * @name post/comment
 * @function
 * @memberof module:routers/comments~commentsRouter
 * @inner
 * @param {string} path - api/comments/:id
 * @param {callback} middleware - Authentication if user is logged in
 */
router.post('/:id', auth, commentController.create);

/**
 * Get all comments route, handles requests about all comments of a post
 * @name get/comments
 * @function
 * @memberof module:routers/comments~commentsRouter
 * @inner
 * @param {string} path - api/comments/post/:id
 */
router.get('/post/:id', commentController.findAll);

/**
 * Get one comment route, handles requests a specific comment
 * @name get/comment
 * @function
 * @memberof module:routers/comments~commentsRouter
 * @inner
 * @param {string} path - api/comments/:id
 */
router.get('/:id', commentController.findOne);


/**
 * Edit comment route, handles requests from edit comment form
 * @name put/comment
 * @function
 * @memberof module:routers/comments~commentsRouter
 * @inner
 * @param {string} path - api/comments/:id
 * @param {callback} middleware - Authentication if user is logged in
 */
router.put('/:id', auth, commentController.updateOne);


/**
 * Delete comment route, handles requests from edit comment form
 * @name delete/comment
 * @function
 * @memberof module:routers/comments~commentsRouter
 * @inner
 * @param {string} path - api/comments/:id
 * @param {callback} middleware - Authentication if user is logged in
 */
router.delete('/:id', auth, commentController.deleteOne);

module.exports = router;

