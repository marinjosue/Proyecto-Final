import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";

const CrearConcierto = () => {
  const [evento, setEvento] = useState({
    nombre: "",
    categoria: "",
    ciudad: "",
    fecha: "",
    lugar: ""
  });

  const [tickets, setTickets] = useState({
    evento_id: "",
    zona_id: "",
    cantidad: ""
  });

  const [eventoCreado, setEventoCreado] = useState(null);

  const handleEventoChange = (e) => {
    setEvento({
      ...evento,
      [e.target.name]: e.target.value
    });
  };

  const handleTicketChange = (e) => {
    setTickets({
      ...tickets,
      [e.target.name]: e.target.value
    });
  };

  const handleCrearEvento = (e) => {
    e.preventDefault();
    const nuevoEvento = { id: uuidv4(), ...evento };
    setEventoCreado(nuevoEvento);
    setTickets((prev) => ({
      ...prev,
      evento_id: nuevoEvento.id
    }));
    alert("🎉 Concierto creado con éxito");
  };

  const handleCrearTicket = (e) => {
    e.preventDefault();
    const nuevoTicket = { ...tickets };
    console.log("✅ Ticket creado:", nuevoTicket);
    alert("🎟️ Ticket creado correctamente");
  };

  return (
    <Container className="py-4">
      <h2 style={{ color: "#ff4081" }}>🎶 Crear Concierto</h2>

      {/* Formulario de concierto */}
      <Form onSubmit={handleCrearEvento} className="bg-dark text-white p-4 rounded mb-4">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" name="nombre" value={evento.nombre} onChange={handleEventoChange} required />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Control type="text" name="categoria" value={evento.categoria} onChange={handleEventoChange} required />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Ciudad</Form.Label>
              <Form.Control type="text" name="ciudad" value={evento.ciudad} onChange={handleEventoChange} required />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control type="date" name="fecha" value={evento.fecha} onChange={handleEventoChange} required />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Lugar</Form.Label>
          <Form.Control type="text" name="lugar" value={evento.lugar} onChange={handleEventoChange} required />
        </Form.Group>
        <Button type="submit" style={{ background: "linear-gradient(90deg, #ff4081, #673ab7)", border: "none" }}>
          Crear Concierto
        </Button>
      </Form>

      {/* Formulario de tickets (solo aparece si hay evento creado) */}
      {eventoCreado && (
        <Form onSubmit={handleCrearTicket} className="bg-secondary text-white p-4 rounded">
          <h4>🎟️ Crear Tickets para {eventoCreado.nombre}</h4>
          <Form.Group className="mb-3">
            <Form.Label>Zona ID</Form.Label>
            <Form.Control type="text" name="zona_id" value={tickets.zona_id} onChange={handleTicketChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control type="number" name="cantidad" value={tickets.cantidad} onChange={handleTicketChange} required />
          </Form.Group>
          <Button type="submit" style={{ background: "linear-gradient(90deg, #00bcd4, #4caf50)", border: "none" }}>
            Crear Ticket
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default CrearConcierto;
