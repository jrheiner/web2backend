const express = require('express')
const auth = require('../_helper/authJwt')
const router = express.Router()

const userController = require('../controller/user.controller')

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/', auth, userController.findSelf)
router.get('/:id', userController.findOne)
router.put('/', auth, userController.updateSelf)
router.delete('/', auth, userController.deleteSelf)

module.exports = router
