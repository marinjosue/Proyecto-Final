const ZonaDTO = require('../dto/zona.dto');
const zonaRepository = require('../repository/zona.repository');

async function crearZona(data) {
    const dto = new ZonaDTO(data);
    return await zonaRepository.crear(dto);
}

async function listarZonasPorConcierto(concierto_id) {
    return await zonaRepository.obtenerPorConcierto(concierto_id);
}

async function actualizarPrecio(id, nuevoPrecio) {
    return await zonaRepository.actualizarPrecio(id, nuevoPrecio);
}

module.exports = {
    crearZona,
    listarZonasPorConcierto,
    actualizarPrecio,
};
