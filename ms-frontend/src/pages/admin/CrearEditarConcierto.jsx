import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner 
} from "react-bootstrap";
import { conciertoService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const CrearEditarConcierto = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    fecha: "",
    lugar: "",
    ciudad: "",
    categoria: "",
    descripcion: ""
  });
  const [loading, setLoading] = useState(false);
  const [loadingConcierto, setLoadingConcierto] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  
  const { id } = useParams(); // Si hay ID, es edición
  const isEditing = !!id;
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const categorias = [
    "Rock", "Pop", "Jazz", "Clásica", "Reggaeton", "Salsa", 
    "Folk", "Electrónica", "Hip Hop", "Country", "Blues", "Otro"
  ];

  const ciudades = [
    "Quito", "Guayaquil", "Cuenca", "Santo Domingo", "Machala", 
    "Durán", "Manta", "Portoviejo", "Loja", "Ambato", "Esmeraldas", 
    "Riobamba", "Milagro", "Ibarra", "La Libertad", "Babahoyo", "Otro"
  ];

  useEffect(() => {
    // Verificar que el usuario sea admin
    if (!isAuthenticated || user?.rol !== 'admin') {
      navigate('/');
      return;
    }

    // Si estamos editando, cargar los datos del concierto
    if (isEditing) {
      loadConcierto();
    }
  }, [isAuthenticated, user, navigate, isEditing, id]);

  const loadConcierto = async () => {
    try {
      setLoadingConcierto(true);
      const concierto = await conciertoService.getConciertoById(id);
      
      // Formatear la fecha para el input datetime-local
      const fechaFormateada = new Date(concierto.fecha).toISOString().slice(0, 16);
      
      setFormData({
        nombre: concierto.nombre,
        fecha: fechaFormateada,
        lugar: concierto.lugar,
        ciudad: concierto.ciudad,
        categoria: concierto.categoria,
        descripcion: concierto.descripcion || ""
      });
    } catch (err) {
      console.error('Error loading concierto:', err);
      setMessage({ 
        type: "error", 
        text: "Error al cargar el concierto. Regresando a la lista..." 
      });
      setTimeout(() => navigate('/admin/conciertos'), 2000);
    } finally {
      setLoadingConcierto(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error específico cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }
    
    if (!formData.fecha) {
      newErrors.fecha = "La fecha es obligatoria";
    } else {
      const fechaConcierto = new Date(formData.fecha);
      const ahora = new Date();
      if (fechaConcierto <= ahora) {
        newErrors.fecha = "La fecha debe ser futura";
      }
    }
    
    if (!formData.lugar.trim()) {
      newErrors.lugar = "El lugar es obligatorio";
    }
    
    if (!formData.ciudad.trim()) {
      newErrors.ciudad = "La ciudad es obligatoria";
    }
    
    if (!formData.categoria.trim()) {
      newErrors.categoria = "La categoría es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ 
        type: "error", 
        text: "Por favor corrige los errores en el formulario" 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const conciertoData = {
        ...formData,
        organizador_id: user.id,
        fecha: new Date(formData.fecha).toISOString()
      };

      let result;
      if (isEditing) {
        result = await conciertoService.updateConcierto(id, conciertoData);
        setMessage({ 
          type: "success", 
          text: "Concierto actualizado exitosamente" 
        });
      } else {
        result = await conciertoService.createConcierto(conciertoData);
        setMessage({ 
          type: "success", 
          text: "Concierto creado exitosamente" 
        });
      }

      // Redirigir después de un breve delay
      setTimeout(() => {
        if (isEditing) {
          navigate('/admin/conciertos');
        } else {
          navigate(`/admin/conciertos/${result.id}/zonas`);
        }
      }, 1500);

    } catch (err) {
      console.error('Error saving concierto:', err);
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el concierto` 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingConcierto) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando concierto...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card style={{ backgroundColor: "#111", color: "#fff" }}>
            <Card.Header>
              <h3 style={{ color: "#ff4081" }}>
                <i className={`bi ${isEditing ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
                {isEditing ? 'Editar Concierto' : 'Crear Nuevo Concierto'}
              </h3>
            </Card.Header>
            <Card.Body>
              {message.text && (
                <Alert 
                  variant={message.type === "success" ? "success" : "danger"}
                  className="mb-3"
                >
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre del Concierto *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        isInvalid={!!errors.nombre}
                        placeholder="Ej: Festival Rock Andino 2025"
                        style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.nombre}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha y Hora *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        isInvalid={!!errors.fecha}
                        style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fecha}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Categoría *</Form.Label>
                      <Form.Select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        isInvalid={!!errors.categoria}
                        style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
                      >
                        <option value="">Selecciona una categoría</option>
                        {categorias.map(categoria => (
                          <option key={categoria} value={categoria}>
                            {categoria}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.categoria}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ciudad *</Form.Label>
                      <Form.Select
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleChange}
                        isInvalid={!!errors.ciudad}
                        style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
                      >
                        <option value="">Selecciona una ciudad</option>
                        {ciudades.map(ciudad => (
                          <option key={ciudad} value={ciudad}>
                            {ciudad}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.ciudad}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Lugar *</Form.Label>
                      <Form.Control
                        type="text"
                        name="lugar"
                        value={formData.lugar}
                        onChange={handleChange}
                        isInvalid={!!errors.lugar}
                        placeholder="Ej: Coliseo Rumiñahui"
                        style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lugar}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label>Descripción (Opcional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Describe el evento, artistas, etc..."
                        style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between">
                  <Button
                    variant="outline-light"
                    onClick={() => navigate('/admin/conciertos')}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: "linear-gradient(90deg, #ff4081, #673ab7)",
                      border: "none",
                      minWidth: "150px"
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        {isEditing ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      <>
                        <i className={`bi ${isEditing ? 'bi-check-circle' : 'bi-plus-circle'} me-1`}></i>
                        {isEditing ? 'Actualizar Concierto' : 'Crear Concierto'}
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CrearEditarConcierto;
