const EntradaDTO = require('../dto/entrada.dto');
const service = require('../services/entrada.service');

exports.crear = async (req, res) => {
  try {
    const dto = EntradaDTO.fromRequest(req.body);
    const entrada = await service.crearEntrada(dto);
    res.status(201).json(entrada);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listar = async (req, res) => {
  try {
    const entradas = await service.listar();
    res.json(entradas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtener = async (req, res) => {
  try {
    const entrada = await service.obtener(req.params.id);
    if (!entrada) return res.status(404).json({ error: 'Entrada no encontrada' });
    res.json(entrada);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerPorUsuario = async (req, res) => {
  try {
    const entradas = await service.obtenerPorUsuario(req.params.usuario_id);
    res.json(entradas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
