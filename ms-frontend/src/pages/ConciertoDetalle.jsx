import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";

// Mismo dataset que en Conciertos.jsx (en proyecto real vendría de API o contexto)
const conciertosData = [
  {
    id: "1",
    nombre: "Rock Fest 2025",
    categoria: "Rock",
    ciudad: "Madrid",
    fecha: "2025-09-15",
    lugar: "Estadio Santiago Bernabéu",
    organizador_id: "ORG123"
  },
  {
    id: "2",
    nombre: "Electro Night",
    categoria: "Electrónica",
    ciudad: "Barcelona",
    fecha: "2025-10-05",
    lugar: "Palau Sant Jordi",
    organizador_id: "ORG456"
  },
  {
    id: "3",
    nombre: "Latin Vibes",
    categoria: "Reggaetón",
    ciudad: "Sevilla",
    fecha: "2025-11-20",
    lugar: "Estadio La Cartuja",
    organizador_id: "ORG789"
  }
];

const ConciertoDetalle = () => {
  const { id } = useParams();
  const concierto = conciertosData.find((c) => c.id === id);

  if (!concierto) {
    return <h2 className="text-center">Concierto no encontrado</h2>;
  }

  return (
    <div
      className="container py-4"
      style={{
        background: "linear-gradient(135deg, #1a1a1a, #2b0052)",
        color: "#fff",
        borderRadius: "15px",
        padding: "20px",
      }}
    >
      <h2 style={{ color: "#ff4081" }}>{concierto.nombre}</h2>
      <p><strong>Categoría:</strong> {concierto.categoria}</p>
      <p><strong>Ciudad:</strong> {concierto.ciudad}</p>
      <p><strong>Fecha:</strong> {concierto.fecha}</p>
      <p><strong>Lugar:</strong> {concierto.lugar}</p>
      <p><strong>Organizador ID:</strong> {concierto.organizador_id}</p>
      <Link to="/conciertos">
        <Button
          style={{
            background: "linear-gradient(90deg, #ff4081, #673ab7)",
            border: "none",
          }}
        >
          Volver
        </Button>
      </Link>
    </div>
  );
};

export default ConciertoDetalle;
