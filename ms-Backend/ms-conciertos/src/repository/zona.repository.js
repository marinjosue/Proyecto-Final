const db = require('../config/db');
const Zona = require('../models/zona.model');

async function crear(zona) {
    const query = `
    INSERT INTO zonas (concierto_id, nombre, precio, capacidad)
    VALUES ($1, $2, $3, $4)
    RETURNING *`;
    const values = [zona.concierto_id, zona.nombre, zona.precio, zona.capacidad];
    const result = await db.query(query, values);
    return new Zona(result.rows[0]);
}

async function obtenerPorConcierto(concierto_id) {
    const result = await db.query(
        'SELECT * FROM zonas WHERE concierto_id = $1',
        [concierto_id]
    );
    return result.rows.map(row => new Zona(row));
}

async function actualizarPrecio(id, precio) {
    const result = await db.query(
        'UPDATE zonas SET precio = $1 WHERE id = $2 RETURNING *',
        [precio, id]
    );
    return result.rows[0] ? new Zona(result.rows[0]) : null;
}

module.exports = {
    crear,
    obtenerPorConcierto,
    actualizarPrecio,
};
