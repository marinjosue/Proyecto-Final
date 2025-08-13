const ReservaService = require('../services/reserva.service');

class AsientoController {
    async obtenerEstadoZona(req, res) {
        try {
            const { zona_id } = req.params;
            const asientos = await ReservaService.obtenerEstadoAsientos(zona_id);
            
            res.json({
                zona_id,
                asientos,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error obtener estado zona:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async bloquearAsientos(req, res) {
        try {
            const { zona_id, asientos } = req.body;
            const usuario_id = req.user.id;

            if (!zona_id || !asientos || !Array.isArray(asientos)) {
                return res.status(400).json({ error: 'Datos inválidos' });
            }

            const resultado = await ReservaService.bloquearAsientos(
                zona_id, 
                asientos, 
                usuario_id
            );

            if (resultado.exito) {
                res.json(resultado);
            } else {
                res.status(409).json(resultado);
            }
        } catch (error) {
            console.error('Error bloquear asientos:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async liberarAsientos(req, res) {
        try {
            const { zona_id, asientos } = req.body;
            const usuario_id = req.user.id;

            const resultado = await ReservaService.liberarAsientos(
                zona_id, 
                asientos, 
                usuario_id
            );

            res.json(resultado);
        } catch (error) {
            console.error('Error liberar asientos:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AsientoController();