const NotificacionDTO = require('../dto/notificacion.dto');
const service = require('../services/notificacion.service');

exports.enviar = async (req, res) => {
  try {
    const data = NotificacionDTO.fromRequest(req.body);
    await service.enviar(data);
    res.status(200).json({ estado: 'enviado', mensaje: 'Correo simulado enviado con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
