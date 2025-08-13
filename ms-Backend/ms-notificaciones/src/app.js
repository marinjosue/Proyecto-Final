const express = require('express');
const app = express();
const notificacionRoutes = require('./routes/notificacion.routes');

app.use(express.json());
app.use('/api/v1/notificaciones', notificacionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'ms-notificaciones',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = app;
