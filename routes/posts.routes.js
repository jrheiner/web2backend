const express = require('express');
const router = express.Router();

const postController = require('../controller/posts.controller')

// POST ROUTES
router.post("/", postController.create);
router.get("/", postController.findAll);
router.get("/:id", postController.findOne);
router.put("/:id", postController.updateOne);
router.delete("/:id", postController.deleteOne)



module.exports = router;
