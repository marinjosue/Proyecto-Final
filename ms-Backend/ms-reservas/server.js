require('dotenv').config();
const app = require('./src/app');
const { connectRabbitMQ } = require('./src/config/rabbitmq');

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`ms-reservas running on port ${PORT}`);
  await connectRabbitMQ();
});
