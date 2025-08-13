// D:\Plataforma-Encuentro\ms-Backend\ms-usuarios\src\controllers\usuario.controller.js
const usuarioService = require('../services/usuario.service');

class UsuarioController {
    async register(req, res) {
        try {
            const nuevoUsuario = await usuarioService.registrar(req.body);
            return res.status(201).json({
                message: 'Usuario registrado con éxito',
                usuario: nuevoUsuario
            });
        } catch (error) {
            let status = 400;
            let mensaje = 'Ocurrió un error al registrar el usuario';

            if (error.message.includes('Todos los campos son obligatorios')) {
                status = 400;
                mensaje = 'Debe completar todos los campos';
            } else if (error.message.includes('correo ya registrado')) {
                status = 409; // Conflicto
                mensaje = 'El correo ya está en uso';
            } else if (error.message.includes('Contraseña insegura')) {
                status = 400;
                mensaje = 'La contraseña no cumple con los requisitos';
            }

            return res.status(status).json({ error: mensaje });
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
