class Concierto {
  constructor({ id, nombre, fecha, lugar, organizador_id,ciudad, categoria }) {
    this.id = id;
    this.nombre = nombre;
    this.fecha = fecha;
    this.lugar = lugar;
    this.organizador_id = organizador_id;
    this.ciudad = ciudad;
    this.categoria = categoria;
  }
}

module.exports = Concierto;
