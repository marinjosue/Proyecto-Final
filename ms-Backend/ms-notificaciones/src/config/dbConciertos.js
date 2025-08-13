const { Pool } = require('pg');

// Configuración basada en variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST || 'cockroach-1',
  port: process.env.DB_PORT || 26257,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'conciertos',
  ssl: process.env.DB_SSL === 'true' ? true : false
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};
