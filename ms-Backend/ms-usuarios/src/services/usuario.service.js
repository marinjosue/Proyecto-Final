const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioDTO = require('../dto/usuario.dto');
const usuarioRepository = require('../repositories/usuario.repository');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

class UsuarioService {

    async registrar(datos) {
        const dto = new UsuarioDTO(datos);
        const existe = await usuarioRepository.obtenerPorCorreo(dto.correo);
        if (existe) throw new Error('Correo ya registrado');

        dto.password = await bcrypt.hash(dto.password, 10);
        const nuevoUsuario = await usuarioRepository.crear(dto);
        return { ...nuevoUsuario, password: undefined };
    }

    async login({ correo, password }) {
        const usuario = await usuarioRepository.obtenerPorCorreo(correo);
        if (!usuario) throw new Error('Credenciales inválidas');

        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) throw new Error('Credenciales inválidas');

        const token = jwt.sign(
            { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: '4h' }
        );


        return { token, usuario: { id: usuario.id, nombres: usuario.nombres, correo: usuario.correo, rol: usuario.rol } };
    }

    async getProfileById(id) {
        const usuario = await usuarioRepository.obtenerPorId(id);
        if (!usuario) throw new Error('No existe');
        return { id: usuario.id, nombres: usuario.nombres, correo: usuario.correo, rol: usuario.rol };
    }

}

module.exports = new UsuarioService();