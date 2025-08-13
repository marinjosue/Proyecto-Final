require('dotenv').config();
const app = require('./src/app');
const { connectRabbitMQ, listenToReservas } = require('./src/config/rabbitmq');
const entradaService = require('./src/services/entrada.service');

const PORT = process.env.PORT || 3003;

app.listen(PORT, async () => {
  console.log(`ms-entradas corriendo en puerto ${PORT}`);
  await connectRabbitMQ();
  await listenToReservas(entradaService.crearDesdeReserva); 
});