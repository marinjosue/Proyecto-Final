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

    // Simulación de notificación
    await enviarCorreo({
      to: data.correo || 'usuario@ejemplo.com',
      subject: 'Código QR generado',
      message: `Tu entrada para el evento ${data.evento} ha sido generada con éxito.`
    });

    channel.ack(msg);
  });
}

module.exports = { connectRabbitMQ, listenToEvents };
