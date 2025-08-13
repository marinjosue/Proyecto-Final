const nodemailer = require('nodemailer');

// Crear el transporte de correo con tus credenciales
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

/**
 * Envía un correo electrónico con una imagen del código QR adjunta
 * @param {Object} options - Opciones para enviar el correo
 * @param {string} options.to - Correo del destinatario
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.message - Mensaje de texto
 * @param {string} options.qrImageBase64 - Imagen QR en base64
 */
async function enviarCorreo({ to, subject, message, qrImageBase64, evento, fecha, lugar, entrada_id }) {
  try {
    // Crear un HTML más atractivo con el QR incrustado
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">Entrada Generada</h1>
        <p style="font-size: 16px; color: #555;">¡Hola!</p>
        <p style="font-size: 16px; color: #555;">${message}</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h2 style="color: #333; margin-bottom: 10px;">Detalles del Evento</h2>
          <p><strong>Evento:</strong> ${evento}</p>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Lugar:</strong> ${lugar}</p>
          <p><strong>ID de Entrada:</strong> ${entrada_id || 'No disponible'}</p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <p style="font-weight: bold; margin-bottom: 15px;">Tu código QR:</p>
          ${qrImageBase64 ? 
            `<img src="data:image/png;base64,${qrImageBase64}" alt="Código QR" style="max-width: 250px; border: 1px solid #ddd; padding: 10px;">` : 
            '<p style="color: #999;">No se pudo generar el código QR</p>'}
        </div>
        
        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
          No respondas a este correo electrónico. Es un mensaje automático.
        </p>
      </div>
    `;

    // Enviar el correo
    const info = await transporter.sendMail({
      from: `"Encuentro - Eventos" <${process.env.MAIL_FROM}>`,
      to,
      subject,
      text: message, // Versión de texto plano
      html: htmlContent // Versión HTML con el QR incrustado
    });

    console.log(`[Email] Enviado a ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Error al enviar:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { enviarCorreo };
