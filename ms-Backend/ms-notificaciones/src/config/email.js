async function enviarCorreo({ to, subject, message }) {
  // Simulación de envío de correo
  console.log('📧 Enviando correo:');
  console.log(`  Para: ${to}`);
  console.log(`  Asunto: ${subject}`);
  console.log(`  Mensaje: ${message}`);
}

module.exports = { enviarCorreo };
