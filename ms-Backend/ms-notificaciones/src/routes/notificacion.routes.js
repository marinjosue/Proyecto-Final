const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificacion.controller');

router.post('/', controller.enviar);

module.exports = router;
