const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioDTO = require('../dto/usuario.dto');
const usuarioRepository = require('../repositories/usuario.repository');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

class UsuarioService {
    async registrar(datos) {
        const { nombres, apellidos, correo, password } = datos;
        
        // Validar campos obligatorios
        if (!nombres || !apellidos || !correo || !password) {
            throw new Error('Todos los campos son obligatorios');
        }

        // Verificar si el correo ya existe
        const existe = await usuarioRepository.obtenerPorCorreo(correo);
        if (existe) {
            throw new Error('correo ya registrado');
        }

        // Validar seguridad de contraseña
        if (password.length < 6) {
            throw new Error('Contraseña insegura');
        }

        // Crear DTO y hashear contraseña
        const dto = new UsuarioDTO({
            ...datos,
            rol: 'usuario' // Asignar rol por defecto
        });
        dto.password = await bcrypt.hash(dto.password, 10);
        
        // Crear usuario en la base de datos
        const nuevoUsuario = await usuarioRepository.crear(dto);
        
        // No retornar la contraseña
        const { password: _, ...usuarioSinPassword } = nuevoUsuario.toObject ? 
            nuevoUsuario.toObject() : nuevoUsuario;
            
        return usuarioSinPassword;
    }

    // ... (mantener los demás métodos existentes)
    async login({ correo, password }) {
        const usuario = await usuarioRepository.obtenerPorCorreo(correo);
        if (!usuario) throw new Error('Credenciales inválidas');

        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) throw new Error('Credenciales inválidas');

        const token = jwt.sign(
            { 
                id: usuario.id, 
                correo: usuario.correo, 
                rol: usuario.rol 
            },
            JWT_SECRET,
            { expiresIn: '4h' }
        );

        const { password: _, ...usuarioSinPassword } = usuario.toObject ? 
            usuario.toObject() : usuario;
            
        return { 
            token, 
            usuario: usuarioSinPassword 
        };
    }

    async getProfileById(id) {
        const usuario = await usuarioRepository.obtenerPorId(id);
        if (!usuario) throw new Error('No existe');
        
        const { password, ...usuarioSinPassword } = usuario.toObject ? 
            usuario.toObject() : usuario;
            
        return usuarioSinPassword;
    }
}

module.exports = new UsuarioService();