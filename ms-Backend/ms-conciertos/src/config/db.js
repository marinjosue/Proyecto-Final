const { Client } = require('pg');

class DatabaseManager {
    constructor() {
        this.currentClient = null;
        this.currentHost = null;
        this.hosts = process.env.DB_HOSTS ? process.env.DB_HOSTS.split(',') : ['cockroach-1', 'cockroach-2', 'cockroach-3'];
        this.currentHostIndex = 0;
        this.isConnecting = false;
        
        this.baseConfig = {
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'conciertos',
            port: process.env.DB_PORT || 26257,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 5000,
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,
        };
    }

    async connectToHost(host) {
        if (this.currentClient && !this.currentClient.ended) {
            await this.currentClient.end();
        }

        this.currentClient = new Client({
            ...this.baseConfig,
            host: host
        });

        await this.currentClient.connect();
        await this.currentClient.query('SELECT 1');
        
        this.currentHost = host;
        console.log(`[DB] ms-conciertos conectado exitosamente a ${host}`);
        
        this.currentClient.on('error', (err) => {
            console.error(`[DB] Error en cliente de ${host}:`, err.message);
            this.handleConnectionError();
        });

        return this.currentClient;
    }

    async connectWithFailover() {
        if (this.isConnecting) return this.currentClient;
        
        this.isConnecting = true;
        
        for (let i = 0; i < this.hosts.length; i++) {
            const hostIndex = (this.currentHostIndex + i) % this.hosts.length;
            const host = this.hosts[hostIndex];
            
            try {
                console.log(`[DB] Intentando conectar a ${host}...`);
                await this.connectToHost(host);
                this.currentHostIndex = hostIndex;
                this.isConnecting = false;
                return this.currentClient;
            } catch (error) {
                console.log(`[DB] Error conectando a ${host}: ${error.message}`);
                continue;
            }
        }
        
        this.isConnecting = false;
        throw new Error('[DB] No se pudo conectar a ningún nodo de CockroachDB');
    }

    async handleConnectionError() {
        if (this.isConnecting) return;
        
        console.log('[DB] Manejando error de conexión, buscando nodo disponible...');
        try {
            this.currentHostIndex = (this.currentHostIndex + 1) % this.hosts.length;
            await this.connectWithFailover();
        } catch (error) {
            console.error('[DB] Falló la reconexión:', error.message);
        }
    }

    async query(text, params) {
        if (!this.currentClient || this.currentClient.ended) {
            await this.connectWithFailover();
        }

        try {
            return await this.currentClient.query(text, params);
        } catch (error) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('closed')) {
                console.log('[DB] Query falló, intentando failover...');
                await this.connectWithFailover();
                return await this.currentClient.query(text, params);
            }
            throw error;
        }
    }

    async end() {
        if (this.currentClient && !this.currentClient.ended) {
            await this.currentClient.end();
        }
    }
}

const dbManager = new DatabaseManager();

dbManager.connectWithFailover().catch(err => {
    console.error('[DB] Error inicial de conexión:', err.message);
});

module.exports = {
    query: (text, params) => dbManager.query(text, params),
    end: () => dbManager.end()
};
