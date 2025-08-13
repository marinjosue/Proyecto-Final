const express = require('express');
const router = express.Router();
const controller = require('../controllers/zona.controller');
const auth = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/auth');

// Solo administradores pueden crear o actualizar precios
router.post('/', auth, isAdmin, controller.crearZona);
router.get('/concierto/:concierto_id', controller.listarZonasPorConcierto);
router.put('/:id/precio', auth, isAdmin, controller.actualizarPrecioZona);

module.exports = router;
