const repo = require('../repository/reserva.repository');
const AsientoRepository = require('../repository/asiento.repository');
const Reserva = require('../models/reserva.model');
const Asiento = require('../models/asiento.model');
const { publishReservaConfirmada } = require('../config/rabbitmq');
const AsientosWebSocket = require('../websocket/asientos.websocket');
const dbConciertos = require('../config/dbConciertos');

// Verificar que exista la zona y crear asientos si es necesario
async function verificarYCrearAsientos(zona_id) {
    const zona = await consultarZona(zona_id);
    if (!zona) throw new Error('Zona no encontrada');

    await AsientoRepository.crearAsientosPorZona(zona_id, zona.capacidad);
    
    return zona;
}

// Consultar información de zona desde ms-conciertos
async function consultarZona(zona_id) {
    try {
        const result = await dbConciertos.query('SELECT * FROM zonas WHERE id = $1', [zona_id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error consultando zona:', error);
        return null;
    }
}

// Obtener estado actual de todos los asientos de una zona
async function obtenerEstadoAsientos(zona_id) {
    await verificarYCrearAsientos(zona_id);
    await liberarBloqueosExpirados();
    
    const asientos = await AsientoRepository.obtenerPorZona(zona_id);
    
    return asientos.map(asiento => ({
        numero: asiento.numero,
        estado: asiento.estado,
        usuario_id: asiento.usuario_id
    }));
}

// Bloquear asientos seleccionados por un usuario temporalmente
async function bloquearAsientos(zona_id, numeros_asientos, usuario_id) {
    await verificarYCrearAsientos(zona_id);
    
    const resultado = {
        exito: false,
        asientos_bloqueados: [],
        asientos_ocupados: [],
        mensaje: ''
    };

    try {
        // Verificar disponibilidad de todos los asientos primero
        for (const numero of numeros_asientos) {
            const asiento = await AsientoRepository.obtenerPorZonaYNumero(zona_id, numero);
            
            if (!asiento || !asiento.puedeSerSeleccionadoPor(usuario_id)) {
                resultado.asientos_ocupados.push(numero);
            }
        }

        if (resultado.asientos_ocupados.length > 0) {
            resultado.mensaje = `Asientos ${resultado.asientos_ocupados.join(', ')} no disponibles`;
            return resultado;
        }

        // Bloquear todos los asientos disponibles
        const bloqueado_hasta = new Date(Date.now() + Asiento.TIEMPO_BLOQUEO);
        
        for (const numero of numeros_asientos) {
            await AsientoRepository.actualizarEstado(zona_id, numero, {
                estado: Asiento.ESTADOS.BLOQUEADO,
                usuario_id,
                bloqueado_hasta
            });
            
            resultado.asientos_bloqueados.push(numero);
        }

        // Programar auto-liberación cuando expire el tiempo
        setTimeout(() => {
            liberarAsientosPorUsuario(zona_id, usuario_id);
        }, Asiento.TIEMPO_BLOQUEO);

        // Notificar cambio a todos los clientes conectados vía WebSocket
        AsientosWebSocket.notificarCambioEstado(zona_id, {
            tipo: 'asientos_bloqueados',
            asientos: resultado.asientos_bloqueados,
            usuario_id,
            estado: Asiento.ESTADOS.BLOQUEADO
        });

        resultado.exito = true;
        resultado.mensaje = `${resultado.asientos_bloqueados.length} asientos bloqueados`;
        
    } catch (error) {
        console.error('Error bloquear asientos:', error);
        resultado.mensaje = 'Error interno';
    }

    return resultado;
}

// Liberar asientos bloqueados por un usuario específico
async function liberarAsientos(zona_id, numeros_asientos, usuario_id) {
    const liberados = [];

    for (const numero of numeros_asientos) {
        const asiento = await AsientoRepository.obtenerPorZonaYNumero(zona_id, numero);
        
        if (asiento && asiento.estaBloqueadoPor(usuario_id)) {
            await AsientoRepository.actualizarEstado(zona_id, numero, {
                estado: Asiento.ESTADOS.DISPONIBLE,
                usuario_id: null,
                bloqueado_hasta: null
            });
            
            liberados.push(numero);
        }
    }

    if (liberados.length > 0) {
        // Notificar liberación vía WebSocket
        AsientosWebSocket.notificarCambioEstado(zona_id, {
            tipo: 'asientos_liberados',
            asientos: liberados,
            usuario_id,
            estado: Asiento.ESTADOS.DISPONIBLE
        });
    }

    return { asientos_liberados: liberados };
}

// Liberar todos los asientos bloqueados por un usuario (timeout)
async function liberarAsientosPorUsuario(zona_id, usuario_id) {
    const liberados = await AsientoRepository.liberarPorUsuario(zona_id, usuario_id);
    
    if (liberados.length > 0) {
        AsientosWebSocket.notificarCambioEstado(zona_id, {
            tipo: 'asientos_liberados',
            asientos: liberados,
            usuario_id,
            razon: 'timeout',
            estado: Asiento.ESTADOS.DISPONIBLE
        });
    }
}

// Limpiar automáticamente asientos con bloqueos expirados
async function liberarBloqueosExpirados() {
    const expirados = await AsientoRepository.liberarBloqueosExpirados();
    
    // Agrupar por zona para notificar eficientemente
    const porZona = {};
    expirados.forEach(({ zona_id, numero }) => {
        if (!porZona[zona_id]) porZona[zona_id] = [];
        porZona[zona_id].push(numero);
    });

    // Notificar liberaciones por zona
    Object.entries(porZona).forEach(([zona_id, asientos]) => {
        AsientosWebSocket.notificarCambioEstado(zona_id, {
            tipo: 'asientos_liberados',
            asientos,
            razon: 'expirado',
            estado: Asiento.ESTADOS.DISPONIBLE
        });
    });
}

// Crear reserva con posibilidad de asientos específicos
async function crear(data) {
    const { evento_id, zona_id, usuario_id, asientos, cantidad } = data;

    try {
        // Si vienen asientos específicos, procesarlos y bloquearlos
        if (asientos && asientos.length > 0) {
            const resultadoBloqueo = await bloquearAsientos(zona_id, asientos, usuario_id);
            
            if (!resultadoBloqueo.exito) {
                throw new Error(resultadoBloqueo.mensaje);
            }

            // Crear reserva temporal con asientos específicos
            const reserva = await repo.createReserva({
                evento_id,
                zona_id,
                usuario_id,
                cantidad: asientos.length,
                asientos_especificos: JSON.stringify(asientos)
            });

            return {
                ...new Reserva(reserva),
                asientos_bloqueados: resultadoBloqueo.asientos_bloqueados
            };
        } else {
            // Crear reserva normal (sin asientos específicos)
            const reserva = await repo.createReserva({ evento_id, zona_id, cantidad, usuario_id });
            return new Reserva(reserva);
        }

    } catch (error) {
        console.error('Error crear reserva:', error);
        throw error;
    }
}

// Confirmar reserva y cambiar asientos a estado confirmado
async function confirmar(id, usuario_id) {
    const reserva = await repo.confirmarReserva(id, usuario_id);

    // Si tiene asientos específicos, confirmarlos en la tabla de asientos
    if (reserva.asientos_especificos) {
        try {
            const asientos = JSON.parse(reserva.asientos_especificos);
            
            // Confirmar cada asiento individual
            for (const numero of asientos) {
                await AsientoRepository.actualizarEstado(reserva.zona_id, numero, {
                    estado: Asiento.ESTADOS.CONFIRMADO,
                    reserva_id: id,
                    bloqueado_hasta: null
                });
            }

            // Notificar confirmación vía WebSocket
            AsientosWebSocket.notificarCambioEstado(reserva.zona_id, {
                tipo: 'asientos_confirmados',
                asientos: asientos,
                usuario_id,
                reserva_id: id,
                estado: Asiento.ESTADOS.CONFIRMADO
            });

            // Publicar evento en RabbitMQ con asientos específicos
            publishReservaConfirmada({
                usuario_id: reserva.usuario_id,
                evento_id: reserva.evento_id,
                zona_id: reserva.zona_id,
                cantidad: reserva.cantidad,
                correo: reserva.correo,
                asientos: asientos
            });
        } catch (error) {
            console.error('Error procesando asientos específicos:', error);
        }
    } else {
        // Publicar evento normal sin asientos específicos
        publishReservaConfirmada({
            usuario_id: reserva.usuario_id,
            evento_id: reserva.evento_id,
            zona_id: reserva.zona_id,
            cantidad: reserva.cantidad,
            correo: reserva.correo 
        });
    }

    return new Reserva(reserva);
}

// Obtener reserva por ID
async function obtenerPorId(id) {
    const reserva = await repo.getReservaById(id);
    return new Reserva(reserva);
}

// Eliminar reserva
async function eliminar(id) {
    await repo.deleteReserva(id);
}

module.exports = {
    crear,
    confirmar,
    obtenerPorId,
    eliminar,
    obtenerEstadoAsientos,
    bloquearAsientos,
    liberarAsientos,
    liberarBloqueosExpirados
};