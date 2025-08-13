const db = require('./dbConciertos');

/**
 * Obtiene la información de un concierto por su ID
 * @param {string} id - ID del concierto
 * @returns {Promise<Object|null>} - Datos del concierto o null si no existe
 */
async function obtenerConciertoPorId(id) {
  try {
    console.log(`[DB] Consultando concierto con ID: ${id}`);
    const res = await db.query('SELECT * FROM conciertos WHERE id = $1', [id]);
    
    if (res.rows.length === 0) {
      console.log(`[DB] No se encontró concierto con ID: ${id}`);
      return null;
    }
    
    console.log(`[DB] Concierto encontrado: ${res.rows[0].nombre}`);
    return res.rows[0];
  } catch (error) {
    console.error(`[DB] Error al obtener concierto ${id}:`, error);
    return null;
  }
}

module.exports = { obtenerConciertoPorId };
