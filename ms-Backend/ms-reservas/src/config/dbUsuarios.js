const { Pool } = require('pg');

const dbUsuarios = new Pool({
    user: 'root',
    host: process.env.DB_HOST || 'cockroach-1',
    database: 'usuarios',
    password: '',
    port: 26257,
    ssl: false
});

module.exports = dbUsuarios;