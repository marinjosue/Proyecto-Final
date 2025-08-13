const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class AsientosWebSocket {
    constructor() {
        this.wss = null;
        this.clientesPorZona = new Map(); // zona_id -> Set de conexiones
        this.clientesPorUsuario = new Map(); // usuario_id -> conexión
    }

    inicializar(server) {
        this.wss = new WebSocket.Server({ 
            server, 
            path: '/ws/asientos' 
        });

        this.wss.on('connection', (ws, req) => {
            console.log('Nueva conexión WebSocket asientos');

            ws.on('message', (data) => {
                try {
                    const mensaje = JSON.parse(data);
                    this.manejarMensaje(ws, mensaje);
                } catch (error) {
                    ws.send(JSON.stringify({ error: 'Mensaje inválido' }));
                }
            });

            ws.on('close', () => {
                this.desconectarCliente(ws);
            });

            ws.on('error', (error) => {
                console.error('Error WebSocket:', error);
            });
        });

        console.log('WebSocket asientos iniciado en /ws/asientos');
    }

    manejarMensaje(ws, mensaje) {
        const { tipo, token, zona_id, usuario_id } = mensaje;

        // Verificar token
        if (!this.verificarToken(token)) {
            ws.send(JSON.stringify({ error: 'Token inválido' }));
            return;
        }

        if (tipo === 'suscribirse_zona') {
            this.suscribirCliente(ws, zona_id, usuario_id);
        }
    }

    suscribirCliente(ws, zona_id, usuario_id) {
        // Asociar con zona
        if (!this.clientesPorZona.has(zona_id)) {
            this.clientesPorZona.set(zona_id, new Set());
        }
        this.clientesPorZona.get(zona_id).add(ws);
        
        // Asociar con usuario
        ws.usuario_id = usuario_id;
        ws.zona_id = zona_id;
        this.clientesPorUsuario.set(usuario_id, ws);

        ws.send(JSON.stringify({
            tipo: 'suscripcion_confirmada',
            zona_id,
            usuario_id
        }));

        console.log(`Usuario ${usuario_id} suscrito a zona ${zona_id}`);
    }

    desconectarCliente(ws) {
        if (ws.zona_id) {
            const clientes = this.clientesPorZona.get(ws.zona_id);
            if (clientes) {
                clientes.delete(ws);
                if (clientes.size === 0) {
                    this.clientesPorZona.delete(ws.zona_id);
                }
            }
        }
        if (ws.usuario_id) {
            this.clientesPorUsuario.delete(ws.usuario_id);
        }
    }

    notificarCambioEstado(zona_id, cambio) {
        const clientes = this.clientesPorZona.get(zona_id);
        if (!clientes || clientes.size === 0) return;

        const mensaje = JSON.stringify({
            tipo: 'cambio_estado_asientos',
            zona_id,
            ...cambio,
            timestamp: new Date().toISOString()
        });

        clientes.forEach(cliente => {
            if (cliente.readyState === WebSocket.OPEN) {
                cliente.send(mensaje);
            }
        });

        console.log(`Notificado a ${clientes.size} clientes zona ${zona_id}:`, cambio.tipo);
    }

    verificarToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return null;
        }
    }
}

module.exports = new AsientosWebSocket();