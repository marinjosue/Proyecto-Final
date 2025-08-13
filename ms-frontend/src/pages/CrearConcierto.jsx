import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { conciertoService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CrearConcierto = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    ciudad: "",
    fecha: "",
    lugar: "",
    descripcion: "",
    precio: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Debes <a href="/login">iniciar sesión</a> para crear un concierto.
        </Alert>
      </Container>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.categoria || !formData.ciudad || 
        !formData.fecha || !formData.lugar) {
      return "Todos los campos obligatorios deben ser completados";
    }
    
    // Validar que la fecha no sea en el pasado
    const selectedDate = new Date(formData.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return "La fecha del concierto no puede ser en el pasado";
    }
    
    // Validar precio si se proporciona
    if (formData.precio && (isNaN(formData.precio) || parseFloat(formData.precio) < 0)) {
      return "El precio debe ser un número válido mayor o igual a 0";
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const errorMsg = validateForm();
    if (errorMsg) {
      setMessage({ type: "error", text: errorMsg });
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para enviar
      const conciertoData = {
        ...formData,
        precio: formData.precio ? parseFloat(formData.precio) : null,
        organizador_id: user?.id || 'default-organizer' // Usar el ID del usuario autenticado
      };

      await conciertoService.createConcierto(conciertoData);
      
      setMessage({ 
        type: "success", 
        text: "¡Concierto creado exitosamente!" 
      });
      
      // Limpiar formulario
      setFormData({
        nombre: "",
        categoria: "",
        ciudad: "",
        fecha: "",
        lugar: "",
        descripcion: "",
        precio: ""
      });

      // Redirigir después de un delay
      setTimeout(() => {
        navigate('/conciertos');
      }, 2000);

    } catch (error) {
      console.error('Error creating concierto:', error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Error al crear el concierto" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 style={{ color: "#ff4081" }}>🎶 Crear Concierto</h2>

      {message.text && (
        <Alert variant={message.type === "success" ? "success" : "danger"} className="mb-4">
          {message.text}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="bg-dark text-white p-4 rounded">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Concierto *</Form.Label>
              <Form.Control 
                type="text" 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange} 
                placeholder="Ej: Rock Fest 2025"
                required 
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Categoría *</Form.Label>
              <Form.Select 
                name="categoria" 
                value={formData.categoria} 
                onChange={handleChange} 
                required
              >
                <option value="">Selecciona una categoría</option>
                <option value="Rock">Rock</option>
                <option value="Pop">Pop</option>
                <option value="Electrónica">Electrónica</option>
                <option value="Reggaetón">Reggaetón</option>
                <option value="Jazz">Jazz</option>
                <option value="Clásica">Clásica</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Otro">Otro</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Ciudad *</Form.Label>
              <Form.Control 
                type="text" 
                name="ciudad" 
                value={formData.ciudad} 
                onChange={handleChange} 
                placeholder="Ej: Madrid"
                required 
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha *</Form.Label>
              <Form.Control 
                type="date" 
                name="fecha" 
                value={formData.fecha} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Lugar del Evento *</Form.Label>
              <Form.Control 
                type="text" 
                name="lugar" 
                value={formData.lugar} 
                onChange={handleChange} 
                placeholder="Ej: Estadio Santiago Bernabéu"
                required 
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Precio (opcional)</Form.Label>
              <Form.Control 
                type="number" 
                step="0.01"
                min="0"
                name="precio" 
                value={formData.precio} 
                onChange={handleChange} 
                placeholder="0.00"
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Descripción (opcional)</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3}
            name="descripcion" 
            value={formData.descripcion} 
            onChange={handleChange} 
            placeholder="Describe el concierto, artistas, etc."
          />
        </Form.Group>

        <Button 
          type="submit" 
          disabled={loading}
          style={{ 
            background: "linear-gradient(90deg, #ff4081, #673ab7)", 
            border: "none" 
          }}
        >
          {loading ? "Creando..." : "Crear Concierto"}
        </Button>
      </Form>
    </Container>
  );
};

export default CrearConcierto;
