const express = require('express');
const auth = require('../_helper/authJwt');

const router = express.Router();

const userController = require('../controller/user.controller')

router.get("/", auth, userController.findSelf);
router.put("/", auth, userController.updateSelf);
router.delete("/", auth, userController.deleteSelf)
router.post("/register", userController.register);
router.post("/login", userController.login);

module.exports = router;
