class NotificacionDTO {
  static fromRequest(body) {
    return {
      to: body.correo,
      subject: body.asunto,
      message: body.mensaje
    };
  }
}

module.exports = NotificacionDTO;
