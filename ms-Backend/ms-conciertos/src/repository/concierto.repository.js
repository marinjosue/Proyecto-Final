const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function guardarConcierto(data) {
  const id = uuidv4();
  await db.query(`
    INSERT INTO conciertos (id, nombre, fecha, lugar, ciudad, categoria, organizador_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, data.nombre, data.fecha, data.lugar, data.ciudad, data.categoria, data.organizador_id]);
  return { ...data, id };
}


async function obtenerTodos({ tipo, fecha }) {
  let query = 'SELECT * FROM conciertos WHERE 1=1';
  const params = [];

  if (tipo) {
    params.push(tipo);
    query += ` AND LOWER(nombre) LIKE '%' || LOWER($${params.length}) || '%'`;
  }

  if (fecha) {
    params.push(fecha);
    query += ` AND DATE(fecha) = $${params.length}`;
  }

  const res = await db.query(query, params);
  return res.rows;
}

async function obtenerPorId(id) {
  const res = await db.query('SELECT * FROM conciertos WHERE id = $1', [id]);
  return res.rows[0];
}

async function actualizarConcierto(id, data) {
  const res = await db.query(`
    UPDATE conciertos
    SET nombre = $1, fecha = $2, lugar = $3, ciudad = $4, categoria = $5, organizador_id = $6
    WHERE id = $7
    RETURNING *`,
    [data.nombre, data.fecha, data.lugar, data.ciudad, data.categoria, data.organizador_id, id]);
  return res.rows[0];
}


async function eliminarConcierto(id) {
  await db.query('DELETE FROM conciertos WHERE id = $1', [id]);
}

module.exports = {
  guardarConcierto,
  obtenerTodos,
  obtenerPorId,
  actualizarConcierto,
  eliminarConcierto
};
