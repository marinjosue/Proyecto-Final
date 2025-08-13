import React, { useEffect } from "react";
import { Container, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redireccionar automáticamente a mis reservas
    if (isAuthenticated) {
      navigate('/mis-reservas');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Debes <a href="/login">iniciar sesión</a> para ver tus reservas.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="text-center py-5">
        <h3 style={{ color: "#ff4081" }}>
          <i className="bi bi-arrow-right-circle me-2"></i>
          Redirigiendo a Mis Reservas...
        </h3>
        <p>Ahora las reservas se crean directamente al comprar tickets.</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/mis-reservas')}
          style={{
            background: "linear-gradient(90deg, #ff4081, #673ab7)",
            border: "none"
          }}
        >
          <i className="bi bi-ticket-perforated me-2"></i>
          Ver Mis Reservas
        </Button>
      </div>
    </Container>
  );
};

export default Cart;
