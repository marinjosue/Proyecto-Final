const express = require('express');
const router = express.Router();
const controller = require('../controllers/reserva.controller');
const auth = require('../middlewares/auth');

router.post('/', auth, controller.crearReserva);
router.put('/:id/confirmar', auth, controller.confirmarReserva);
router.get('/:id', controller.obtenerReserva);
router.delete('/:id', auth, controller.eliminarReserva);

module.exports = router;