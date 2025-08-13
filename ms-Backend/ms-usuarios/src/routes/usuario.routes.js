const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuario.controller');
const auth = require('../middlewares/auth');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me',  auth(), controller.getProfile);

module.exports = router;
