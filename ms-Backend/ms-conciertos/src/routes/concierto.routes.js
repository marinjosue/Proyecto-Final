const express = require('express');
const router = express.Router();
const controller = require('../controllers/concierto.controller');
const auth = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/auth');

router.post('/', auth, isAdmin, controller.crear);
router.put('/:id', auth, isAdmin, controller.actualizar);
router.delete('/:id', auth, isAdmin, controller.eliminar);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);

module.exports = router;
