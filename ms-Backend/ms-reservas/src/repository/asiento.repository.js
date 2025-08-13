const db = require('../config/db');
const Asiento = require('../models/asiento.model');

class AsientoRepository {
    
    async crearAsientosPorZona(zona_id, capacidad) {
        const query = `
            INSERT INTO asientos (zona_id, numero, estado)
            SELECT $1, generate_series(1, $2), 'disponible'
            ON CONFLICT (zona_id, numero) DO NOTHING
        `;
        await db.query(query, [zona_id, capacidad]);
    }

    async obtenerPorZona(zona_id) {
        const query = `
            SELECT * FROM asientos 
            WHERE zona_id = $1 
            ORDER BY numero
        `;
        const result = await db.query(query, [zona_id]);
        return result.rows.map(row => new Asiento(row));
    }

    async obtenerPorZonaYNumero(zona_id, numero) {
        const query = `
            SELECT * FROM asientos 
            WHERE zona_id = $1 AND numero = $2
        `;
        const result = await db.query(query, [zona_id, numero]);
        return result.rows[0] ? new Asiento(result.rows[0]) : null;
    }

    async actualizarEstado(zona_id, numero, datos) {
        const { estado, usuario_id, reserva_id, bloqueado_hasta } = datos;
        const query = `
            UPDATE asientos 
            SET estado = $1, usuario_id = $2, reserva_id = $3, 
                bloqueado_hasta = $4, updated_at = NOW()
            WHERE zona_id = $5 AND numero = $6
            RETURNING *
        `;
        const result = await db.query(query, [
            estado, usuario_id, reserva_id, bloqueado_hasta, zona_id, numero
        ]);
        return result.rows[0] ? new Asiento(result.rows[0]) : null;
    }

    async liberarBloqueosExpirados() {
        const query = `
            UPDATE asientos 
            SET estado = 'disponible', usuario_id = NULL, 
                reserva_id = NULL, bloqueado_hasta = NULL
            WHERE estado = 'bloqueado' 
            AND bloqueado_hasta < NOW()
            RETURNING zona_id, numero
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async liberarPorUsuario(zona_id, usuario_id) {
        const query = `
            UPDATE asientos 
            SET estado = 'disponible', usuario_id = NULL, 
                reserva_id = NULL, bloqueado_hasta = NULL
            WHERE zona_id = $1 AND usuario_id = $2 AND estado = 'bloqueado'
            RETURNING numero
        `;
        const result = await db.query(query, [zona_id, usuario_id]);
        return result.rows.map(row => row.numero);
    }
}

module.exports = new AsientoRepository();