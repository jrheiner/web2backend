const express = require('express');
const router = express.Router();

const commentController = require('../controller/comments.controller')

router.post("/", commentController.create);
router.get("/post/:id", commentController.findAll);
router.get("/:id", commentController.findOne);
router.put("/:id", commentController.updateOne);
router.delete("/:id", commentController.deleteOne)

module.exports = router;
