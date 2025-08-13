const { generarQR } = require('../utils/qrgenerator');
const repository = require('../repository/entrada.repository');
const Entrada = require('../models/entrada.model');
const { publishQREvent } = require('../config/rabbitmq');

async function crearEntrada(data) {
  const qr = await generarQR(data);
  const entrada = new Entrada({ ...data, qr_code: qr });
  const guardada = await repository.guardarEntrada(entrada);
  return guardada;
}

async function crearDesdeReserva(evento) {
  const entrada = await crearEntrada({
    usuario_id: evento.usuario_id,
    evento_id: evento.evento_id,
    zona_id: evento.zona_id || 'general',
    cantidad: evento.cantidad
  });

  publishQREvent({
    correo: evento.correo, // Ahora real
    evento: evento.evento_id,
    entrada_id: entrada.id,
    qr: entrada.qr_code
  });

  return entrada;
}


async function listar() {
  return await repository.obtenerTodas();
}

async function obtener(id) {
  return await repository.obtenerPorId(id);
}

async function obtenerPorUsuario(usuario_id) {
  return await repository.obtenerPorUsuario(usuario_id);
}

module.exports = {
  crearEntrada,
  crearDesdeReserva,
  listar,
  obtener,
  obtenerPorUsuario // <-- agrega esto
};
