const db = require('../config/db');
const Usuario = require('../models/usuario.model');

async function crear(usuario) {
    const { nombres, apellidos, correo, password, rol } = usuario;
    const result = await db.query(
        `INSERT INTO usuarios (nombres, apellidos, correo, password, rol)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [nombres, apellidos, correo, password, rol]
    );
    return new Usuario(result.rows[0]);
}

async function obtenerPorCorreo(correo) {
    const result = await db.query(
        `SELECT * FROM usuarios WHERE correo = $1`,
        [correo]
    );
    return result.rows[0] ? new Usuario(result.rows[0]) : null;
}

async function obtenerPorId(id) {
    const result = await db.query(
        `SELECT * FROM usuarios WHERE id = $1`,
        [id]
    );
    return result.rows[0] ? new Usuario(result.rows[0]) : null;
}

module.exports = {
    crear,
    obtenerPorCorreo,
    obtenerPorId,
};
