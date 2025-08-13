class ZonaDTO {
    constructor({ concierto_id, nombre, capacidad, precio }) {
        this.concierto_id = concierto_id;
        this.nombre = nombre;
        this.capacidad = capacidad;
        this.precio = precio;
    }
}

module.exports = ZonaDTO;
