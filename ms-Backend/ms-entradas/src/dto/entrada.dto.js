class EntradaDTO {
  static fromRequest(body) {
    return {
      evento_id: body.evento_id,
      zona_id: body.zona_id,
      cantidad: body.cantidad,
      usuario_id: body.usuario_id
    };
  }
}

module.exports = EntradaDTO;
