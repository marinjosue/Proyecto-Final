const amqp = require('amqplib');


let channel;

async function connectRabbitMQ() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await conn.createChannel();

  await channel.assertQueue(process.env.RABBITMQ_IN_QUEUE, { durable: true });
  await channel.assertQueue(process.env.RABBITMQ_OUT_QUEUE, { durable: true });

  console.log('[RabbitMQ] Conectado y colas listas');
}

function publishQREvent(data) {
  channel.sendToQueue(
    process.env.RABBITMQ_OUT_QUEUE,
    Buffer.from(JSON.stringify(data))
  );
}

async function listenToReservas(crearDesdeReserva) {
  channel.consume(process.env.RABBITMQ_IN_QUEUE, async (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log('[Evento recibido: reserva_confirmada]', data);

    await crearDesdeReserva(data); // genera entrada y QR

    channel.ack(msg);
  });
}

module.exports = { connectRabbitMQ, publishQREvent, listenToReservas };
