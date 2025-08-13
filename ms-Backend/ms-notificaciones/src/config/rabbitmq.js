const amqp = require('amqplib');
const { enviarCorreo } = require('./email');
const { obtenerConciertoPorId } = require('./dbEventos');

let channel;

async function connectRabbitMQ() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await conn.createChannel();
  await channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: true });
  console.log('[RabbitMQ] Conectado y cola asegurada');
}

async function listenToEvents() {
  if (!channel) return;

  channel.consume(process.env.RABBITMQ_QUEUE, async (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log('[Evento recibido]:', data);

    // Obtener información del evento desde la base de datos
    let nombreEvento = 'evento';
    let fecha = 'Por confirmar';
    let lugar = 'Por confirmar';
    
    try {
      // Obtener detalles del evento usando el ID
      const eventoDetails = await obtenerConciertoPorId(data.evento);
      if (eventoDetails) {
        nombreEvento = eventoDetails.nombre;
        fecha = eventoDetails.fecha ? new Date(eventoDetails.fecha).toLocaleDateString() : 'Por confirmar';
        lugar = eventoDetails.lugar || 'Por confirmar';
      }
    } catch (error) {
      console.error('[Error] No se pudo obtener la información del evento:', error);
    }
    
    // Extraer la parte de la imagen base64 del QR si viene con prefijo data:image/png;base64,
    let qrImageBase64 = data.qr;
    if (qrImageBase64 && qrImageBase64.includes('base64,')) {
      qrImageBase64 = qrImageBase64.split('base64,')[1];
    }

    // Enviar correo con la imagen QR
    await enviarCorreo({
      to: data.correo || 'usuario@ejemplo.com',
      subject: 'Tu entrada para el evento',
      message: `Tu entrada para el evento ${nombreEvento} ha sido generada con éxito.`,
      qrImageBase64: qrImageBase64,
      evento: nombreEvento,
      fecha: fecha,
      lugar: lugar,
      entrada_id: data.entrada_id
    });

    channel.ack(msg);
  });
}

module.exports = { connectRabbitMQ, listenToEvents };
