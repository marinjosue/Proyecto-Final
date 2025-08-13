const service = require('../services/concierto.service');

async function crear(req, res) {
  try {
    const concierto = await service.crear(req.body);
    res.status(201).json(concierto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function listar(req, res) {
  try {
    const conciertos = await service.listar(req.query);
    res.json(conciertos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function obtener(req, res) {
  try {
    const concierto = await service.buscarPorId(req.params.id);
    if (!concierto) return res.status(404).json({ message: 'No encontrado' });
    res.json(concierto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function actualizar(req, res) {
  try {
    const actualizado = await service.actualizar(req.params.id, req.body);
    res.json(actualizado);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

async function eliminar(req, res) {
  try {
    const eliminado = await service.eliminar(req.params.id);
    res.json(eliminado);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

module.exports = {
  crear,
  listar,
  obtener,
  actualizar,
  eliminar
};
