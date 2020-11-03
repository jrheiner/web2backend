const express = require('express');
const auth = require('../_helper/authJwt');
const router = express.Router();

const commentController = require('../controller/comments.controller')

// TODO handle post deletion -> delete comments of that post

router.post("/", auth, commentController.create);
router.get("/post/:id", commentController.findAll);
router.get("/:id", commentController.findOne);
router.put("/:id", auth, commentController.updateOne);
router.delete("/:id", auth, commentController.deleteOne)

module.exports = router;
