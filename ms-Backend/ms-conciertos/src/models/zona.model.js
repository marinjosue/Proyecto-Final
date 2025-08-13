class Zona {
    constructor({ id, concierto_id, nombre, capacidad, precio }) {
        this.id = id;
        this.concierto_id = concierto_id;
        this.nombre = nombre;
        this.capacidad = capacidad;
        this.precio = precio;
    }
}

module.exports = Zona;
