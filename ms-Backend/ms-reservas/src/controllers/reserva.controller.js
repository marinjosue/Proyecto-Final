const service = require('../services/reserva.service');

async function crearReserva(req, res) {
    try {
        const usuario_id = req.user.id;
        const { evento_id, zona_id, cantidad } = req.body;
        const reserva = await service.crear({ evento_id, zona_id, cantidad, usuario_id });
        res.status(201).json(reserva);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function confirmarReserva(req, res) {
    try {
        const usuario_id = req.user.id;
        const { id } = req.params;
        const reserva = await service.confirmar(id, usuario_id);
        if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada' });
        res.json(reserva);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
}

async function obtenerReserva(req, res) {
    try {
        const { id } = req.params;
        const reserva = await service.obtenerPorId(id);
        if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada' });
        res.json(reserva);
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

async function eliminarReserva(req, res) {
    try {
        const { id } = req.params;
        await service.eliminar(id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
}

module.exports = {
    crearReserva,
    confirmarReserva,
    obtenerReserva,
    eliminarReserva
};
