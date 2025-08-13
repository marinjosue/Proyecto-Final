class Asiento {
    constructor({ id, zona_id, numero, estado, usuario_id, reserva_id, bloqueado_hasta }) {
        this.id = id;
        this.zona_id = zona_id;
        this.numero = numero;
        this.estado = estado;
        this.usuario_id = usuario_id;
        this.reserva_id = reserva_id;
        this.bloqueado_hasta = bloqueado_hasta;
    }

    static ESTADOS = {
        DISPONIBLE: 'disponible',   // Verde
        BLOQUEADO: 'bloqueado',     // Azul
        CONFIRMADO: 'confirmado'    // Rojo
    };

    static TIEMPO_BLOQUEO = 10 * 60 * 1000; // 10 minutos

    estaDisponible() {
        return this.estado === Asiento.ESTADOS.DISPONIBLE;
    }

    estaBloqueadoPor(usuario_id) {
        return this.estado === Asiento.ESTADOS.BLOQUEADO && 
               this.usuario_id === usuario_id;
    }

    puedeSerSeleccionadoPor(usuario_id) {
        return this.estaDisponible() || this.estaBloqueadoPor(usuario_id);
    }
}

module.exports = Asiento;