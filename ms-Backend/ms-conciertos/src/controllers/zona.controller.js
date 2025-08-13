const zonaService = require('../services/zona.service');

async function crearZona(req, res) {
    try {
        const zona = await zonaService.crearZona(req.body);
        res.status(201).json(zona);
    } catch (err) {
        res.status(400).json({ message: `Error al crear zona: ${err.message}` });
    }
}

async function listarZonasPorConcierto(req, res) {
    try {
        const { concierto_id } = req.params;
        const zonas = await zonaService.listarZonasPorConcierto(concierto_id);

        if (!zonas || zonas.length === 0) {
            return res.status(404).json({ message: 'No hay zonas registradas para este concierto' });
        }

        res.json(zonas);
    } catch (err) {
        res.status(500).json({ message: `Error del servidor: ${err.message}` });
    }
}

async function actualizarPrecioZona(req, res) {
    try {
        const { id } = req.params;
        const { precio } = req.body;

        if (isNaN(precio) || precio <= 0) {
            return res.status(400).json({ message: 'Precio inválido' });
        }

        const zona = await zonaService.actualizarPrecio(id, precio);
        if (!zona) return res.status(404).json({ message: 'Zona no encontrada' });

        res.json(zona);
    } catch (err) {
        res.status(500).json({ message: `Error al actualizar precio: ${err.message}` });
    }
}

module.exports = {
    crearZona,
    listarZonasPorConcierto,
    actualizarPrecioZona,
};
