const db = require('../config/db');
const dbConciertos = require('../config/dbConciertos');
const dbUsuarios = require('../config/dbUsuarios'); 
const { v4: uuidv4 } = require('uuid');

async function createReserva({ evento_id, zona_id, cantidad, usuario_id, asientos_especificos }) {
    const id = uuidv4();

    // Validar que exista el concierto
    const concierto = await dbConciertos.query(`SELECT id FROM conciertos WHERE id = $1`, [evento_id]);
    if (!concierto.rows[0]) throw new Error('Concierto no encontrado');

    // Validar disponibilidad en la base de conciertos
    const zona = await dbConciertos.query(`SELECT capacidad FROM zonas WHERE id = $1`, [zona_id]);
    if (!zona.rows[0]) throw new Error('Zona no encontrada');
    if (zona.rows[0].capacidad < cantidad) throw new Error('No hay suficientes cupos');

    const vencimiento = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    const result = await db.query(`
    INSERT INTO reservas (id, evento_id, zona_id, cantidad, estado, vencimiento, usuario_id, asientos_especificos)
    VALUES ($1, $2, $3, $4, 'temporal', $5, $6, $7)
    RETURNING *`,
        [id, evento_id, zona_id, cantidad, vencimiento, usuario_id, asientos_especificos]);

    return result.rows[0];
}

async function confirmarReserva(id, usuario_id) {
    // Verificar reserva
    const reserva = await db.query(`SELECT * FROM reservas WHERE id = $1 AND usuario_id = $2`, [id, usuario_id]);
    if (!reserva.rows[0]) throw new Error('Reserva no válida');

    // Obtener correo del usuario desde la base de usuarios
    const usuario = await dbUsuarios.query(`SELECT correo FROM usuarios WHERE id = $1`, [usuario_id]);
    if (!usuario.rows[0]) throw new Error('Usuario no encontrado');
    const correo = usuario.rows[0].correo;

    // Validar nuevamente disponibilidad en la base de conciertos
    const zona = await dbConciertos.query(`SELECT capacidad FROM zonas WHERE id = $1`, [reserva.rows[0].zona_id]);
    if (!zona.rows[0] || zona.rows[0].capacidad < reserva.rows[0].cantidad) {
        throw new Error('Ya no hay disponibilidad');
    }

    // Confirmar y descontar en la base de conciertos
    await dbConciertos.query(`UPDATE zonas SET capacidad = capacidad - $1 WHERE id = $2`,
        [reserva.rows[0].cantidad, reserva.rows[0].zona_id]);

    const confirmada = await db.query(`
    UPDATE reservas SET estado = 'confirmada' WHERE id = $1 RETURNING *`,
        [id]);

    // Retornar también el correo y asientos específicos
    return { 
        ...confirmada.rows[0], 
        correo,
        asientos_especificos: reserva.rows[0].asientos_especificos 
    };
}

async function getReservaById(id) {
    const result = await db.query(`SELECT * FROM reservas WHERE id = $1`, [id]);
    return result.rows[0];
}

async function deleteReserva(id) {
    await db.query(`DELETE FROM reservas WHERE id = $1`, [id]);
}

module.exports = {
    createReserva,
    confirmarReserva,
    getReservaById,
    deleteReserva
};