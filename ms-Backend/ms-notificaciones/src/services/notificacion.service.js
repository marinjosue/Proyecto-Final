const { enviarCorreo } = require('../config/email');

async function enviar(data) {
  return await enviarCorreo(data);
}

module.exports = { enviar };
