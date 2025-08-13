const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function guardarEntrada(entrada) {
  const id = uuidv4();
  await db.query(`
    INSERT INTO entradas (id, evento_id, usuario_id, zona_id, cantidad, qr_code, fecha)
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, entrada.evento_id, entrada.usuario_id, entrada.zona_id, entrada.cantidad, entrada.qr_code, entrada.fecha]);
  return { ...entrada, id };
}

async function obtenerTodas() {
  const res = await db.query('SELECT * FROM entradas');
  return res.rows;
}

async function obtenerPorId(id) {
  const res = await db.query('SELECT * FROM entradas WHERE id = $1', [id]);
  return res.rows[0];
}


async function obtenerPorUsuario(usuario_id) {
  const res = await db.query('SELECT * FROM entradas WHERE usuario_id = $1', [usuario_id]);
  return res.rows;
}

module.exports = {
  guardarEntrada,
  obtenerTodas,
  obtenerPorId,
  obtenerPorUsuario // <-- agrega esto
};
