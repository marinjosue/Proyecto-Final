const repository = require('../repository/concierto.repository');
const Concierto = require('../models/concierto.model');
const e = require('express');

async function crear(data) {
  const concierto = new Concierto(data);
  return await repository.guardarConcierto(concierto);
}

async function listar(filtros) {
  return await repository.obtenerTodos(filtros);
}

async function buscarPorId(id) {
  return await repository.obtenerPorId(id);
}
async function actualizar(id, data) {
  const concierto = await buscarPorId(id);
  if (!concierto) throw new Error('Concierto no encontrado');

  Object.assign(concierto, data);
  return await repository.actualizarConcierto(id, concierto);
}

async function eliminar(id) {
  const concierto = await buscarPorId(id); 
  if (!concierto) throw new Error('Concierto no encontrado');
  await repository.eliminarConcierto(id);
  return concierto;
}

module.exports = {
  crear,
  listar,
  buscarPorId,
  actualizar,
  eliminar
};
