const { Pool } = require('pg');

const dbConciertos = new Pool({
    user: 'root',
    host: process.env.DB_HOST || 'cockroach-1',
    database: 'conciertos',
    password: '',
    port: 26257,
    ssl: false
});

module.exports = dbConciertos;