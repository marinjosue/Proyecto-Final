const usuarioService = require('../services/usuario.service');

class UsuarioController {
    
    async register(req, res) {
        try {
            const nuevoUsuario = await usuarioService.registrar(req.body);
            res.status(201).json({ message: 'Usuario registrado', usuario: nuevoUsuario });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { token, usuario } = await usuarioService.login(req.body);
            res.status(200).json({ message: 'Login exitoso', token, usuario });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const usuario = await usuarioService.getProfileById(req.user.id);
            res.status(200).json({ usuario });
        } catch (error) {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    }
}

module.exports = new UsuarioController();
