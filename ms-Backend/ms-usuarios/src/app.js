const express = require('express');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuario.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/usuarios', usuarioRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'ms-usuarios',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = app;
