const repo = require('../repository/reserva.repository');
const Reserva = require('../models/reserva.model');
const { publishReservaConfirmada } = require('../config/rabbitmq');


async function crear(data) {
    const reserva = await repo.createReserva(data);
    return new Reserva(reserva);
}

async function confirmar(id, usuario_id) {
    const reserva = await repo.confirmarReserva(id, usuario_id);

    // Publicar evento en RabbitMQ con el correo
    publishReservaConfirmada({
        usuario_id: reserva.usuario_id,
        evento_id: reserva.evento_id,
        zona_id: reserva.zona_id,
        cantidad: reserva.cantidad,
        correo: reserva.correo 
    });

    return new Reserva(reserva);
}

async function obtenerPorId(id) {
    const reserva = await repo.getReservaById(id);
    return new Reserva(reserva);
}

async function eliminar(id) {
    await repo.deleteReserva(id);
}

module.exports = {
    crear,
    confirmar,
    obtenerPorId,
    eliminar
};
