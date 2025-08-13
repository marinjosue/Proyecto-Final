const express = require('express');
const cors = require('cors');
const reservaRoutes = require('./routes/reserva.routes');
const asientoRoutes = require('./routes/asiento.routes');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/v1/reservas', reservaRoutes);
app.use('/api/v1', asientoRoutes); // Nuevas rutas de asientos

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'ms-reservas',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = app;