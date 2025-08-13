class Usuario {
  constructor({ id, nombres, apellidos, correo, password, rol = 'usuario' }) {
    this.id = id;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.correo = correo;
    this.password = password;
    this.rol = rol;
  }
}

module.exports = Usuario;
