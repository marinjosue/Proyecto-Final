const express = require('express');
const cors = require('cors');
const conciertoRoutes = require('./routes/concierto.routes');
const zonasRoutes = require('./routes/zona.routes');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/v1/conciertos', conciertoRoutes);
app.use('/api/v1/zonas', zonasRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'ms-conciertos',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = app;