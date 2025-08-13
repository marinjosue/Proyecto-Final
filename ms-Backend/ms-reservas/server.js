require('dotenv').config();
const app = require('./src/app');
const { connectRabbitMQ } = require('./src/config/rabbitmq');
const AsientosWebSocket = require('./src/websocket/asientos.websocket');
const ReservaService = require('./src/services/reserva.service');

const PORT = process.env.PORT || 3001;

// Crear servidor HTTP para WebSocket
const server = require('http').createServer(app);

// Inicializar WebSocket
AsientosWebSocket.inicializar(server);

server.listen(PORT, async () => {
  console.log(`ms-reservas running on port ${PORT}`);
  console.log(`WebSocket disponible en ws://localhost:${PORT}/ws/asientos`);
  await connectRabbitMQ();
});

// Limpiar bloqueos expirados cada minuto
setInterval(() => {
    ReservaService.liberarBloqueosExpirados().catch(console.error);
}, 60000);