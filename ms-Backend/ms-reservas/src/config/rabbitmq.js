const amqp = require('amqplib');

let channel;

async function connectRabbitMQ() {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: true });
    console.log('[RabbitMQ] Connected and channel ready');
}

function publishReservaConfirmada(payload) {
    if (!channel) return;
    channel.sendToQueue(
        process.env.RABBITMQ_QUEUE,
        Buffer.from(JSON.stringify(payload))
    );
}

module.exports = { connectRabbitMQ, publishReservaConfirmada };
