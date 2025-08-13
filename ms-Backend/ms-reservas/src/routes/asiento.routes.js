const express = require('express');
const router = express.Router();
const AsientoController = require('../controllers/asiento.controller');
const auth = require('../middlewares/auth');

// Obtener estado de asientos de una zona
router.get('/zona/:zona_id/asientos', AsientoController.obtenerEstadoZona);

// Bloquear asientos para selección
router.post('/asientos/bloquear', auth, AsientoController.bloquearAsientos);

// Liberar asientos seleccionados
router.post('/asientos/liberar', auth, AsientoController.liberarAsientos);

module.exports = router;