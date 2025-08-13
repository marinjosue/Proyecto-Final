const express = require('express');
const cors = require('cors');
const app = express();
const conciertoRoutes = require('./routes/concierto.routes');
const zonasRoutes = require('./routes/zona.routes');

// Enable CORS for all routes
app.use(cors());

app.use(express.json());
app.use('/api/v1/conciertos', conciertoRoutes);
app.use('/api/v1/zonas', zonasRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'ms-conciertos',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = app;
