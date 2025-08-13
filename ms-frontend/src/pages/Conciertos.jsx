import React from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Card, Button, Row, Col } from "react-bootstrap";

const conciertosData = [
  {
    id: uuidv4(),
    nombre: "Rock Fest 2025",
    categoria: "Rock",
    ciudad: "Madrid",
    fecha: "2025-09-15",
    lugar: "Estadio Santiago Bernabéu",
    organizador_id: "ORG123"
  },
  {
    id: uuidv4(),
    nombre: "Electro Night",
    categoria: "Electrónica",
    ciudad: "Barcelona",
    fecha: "2025-10-05",
    lugar: "Palau Sant Jordi",
    organizador_id: "ORG456"
  },
  {
    id: uuidv4(),
    nombre: "Latin Vibes",
    categoria: "Reggaetón",
    ciudad: "Sevilla",
    fecha: "2025-11-20",
    lugar: "Estadio La Cartuja",
    organizador_id: "ORG789"
  }
];

const Conciertos = () => {
  return (
    <div className="container py-4">
      <h3 className="text-center mb-4" style={{ color: "#ff4081" }}>
        🎤 Próximos Conciertos
      </h3>
      <Row>
        {conciertosData.map((concierto) => (
          <Col md={4} key={concierto.id} className="mb-4">
            <Card
              style={{
                backgroundColor: "#111",
                color: "#fff",
                borderRadius: "15px",
              }}
              className="shadow-lg"
            >
              <Card.Body>
                <Card.Title style={{ color: "#00bcd4" }}>
                  {concierto.nombre}
                </Card.Title>
                <Card.Text>
                  <strong>Ciudad:</strong> {concierto.ciudad} <br />
                  <strong>Fecha:</strong> {concierto.fecha}
                </Card.Text>
                <Link to={`/concierto/${concierto.id}`}>
                  <Button
                    style={{
                      background:
                        "linear-gradient(90deg, #ff4081, #673ab7)",
                      border: "none",
                    }}
                  >
                    Ver más
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Conciertos;
