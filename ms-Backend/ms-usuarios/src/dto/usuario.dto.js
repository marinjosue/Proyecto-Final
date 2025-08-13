class UsuarioDTO {
    constructor({ nombres, apellidos, correo, password, rol = 'usuario' }) {
        if (!nombres || !apellidos || !correo || !password || !rol) {
            throw new Error('Todos los campos son obligatorios');
        }

        this.nombres = nombres.trim();
        this.apellidos = apellidos.trim();
        this.correo = correo.toLowerCase().trim();
        this.password = password;
        this.rol = rol.toLowerCase().trim();
    }
}

module.exports = UsuarioDTO;
