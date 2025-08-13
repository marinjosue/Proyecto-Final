const { v4: uuidv4 } = require('uuid');

class ConciertoDTO {
  constructor({ nombre, categoria, ciudad, fecha, lugar, organizador_id }) {
    this.id = uuidv4();
    this.nombre = nombre;
    this.categoria = categoria;
    this.ciudad = ciudad;
    this.fecha = fecha;
    this.lugar = lugar;
    this.organizador_id = organizador_id;
  }
}

module.exports = ConciertoDTO;
