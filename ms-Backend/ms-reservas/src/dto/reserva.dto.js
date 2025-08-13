class ReservaDTO {
    static fromCreateRequest(body) {
        return {
            evento_id: body.evento_id,
            zona_id: body.zona_id,
            cantidad: body.cantidad
        };
    }

    static fromConfirmRequest(body) {
        return {
            reserva_id: body.reserva_id,
            metodo_pago: body.metodo_pago
        };
    }
}

module.exports = ReservaDTO;
