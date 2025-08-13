require('dotenv').config();
const app = require('./src/app');
const { connectRabbitMQ, listenToEvents } = require('./src/config/rabbitmq');

const PORT = process.env.PORT || 3002;

app.listen(PORT, async () => {
  console.log(`ms-notificaciones corriendo en puerto ${PORT}`);
  await connectRabbitMQ();
  await listenToEvents(); // empieza a escuchar la cola qr_generado
});
