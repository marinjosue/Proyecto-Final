const amqp = require('amqplib');
const { enviarCorreo } = require('./email');

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

    // Enviar correo con la imagen QR
    await enviarCorreo({
      to: data.correo || 'usuario@ejemplo.com',
      subject: 'Tu entrada para el evento',
      message: `Tu entrada para el evento ${data.evento} ha sido generada con éxito.`,
      qrImageBase64: data.qrBase64, // La imagen del QR en formato base64
      evento: data.evento,
      fecha: data.fecha || 'Por confirmar',
      lugar: data.lugar || 'Por confirmar'
    });

    channel.ack(msg);
  });
}

module.exports = { connectRabbitMQ, listenToEvents };
