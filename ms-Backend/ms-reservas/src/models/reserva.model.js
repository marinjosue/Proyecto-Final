class Reserva {
    constructor(data) {
        this.id = data.id;
        this.evento_id = data.evento_id;
        this.zona_id = data.zona_id;
        this.cantidad = data.cantidad;
        this.estado = data.estado;
        this.vencimiento = data.vencimiento;
        this.usuario_id = data.usuario_id;
        this.correo = data.correo; // <-- agrega esto
    }
}

module.exports = Reserva;