class Entrada {
  constructor({ id, evento_id, usuario_id, zona_id, cantidad, qr_code, fecha }) {
    this.id = id;
    this.evento_id = evento_id;
    this.usuario_id = usuario_id || null;
    this.zona_id = zona_id;
    this.cantidad = cantidad;
    this.qr_code = qr_code;
    this.fecha = fecha || new Date();
  }
}

module.exports = Entrada;
