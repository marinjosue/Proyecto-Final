import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner,
  Table,
  Modal,
  Badge,
  InputGroup,
  Tabs,
  Tab
} from "react-bootstrap";
import { conciertoService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const GestionarZonas = () => {
  const [concierto, setConcierto] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [zonaToDelete, setZonaToDelete] = useState(null);
  const [editingZona, setEditingZona] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: "",
    capacidad: "",
    precio: ""
  });
  const [layoutType, setLayoutType] = useState("recto"); 
  const [errors, setErrors] = useState({});
  const [previewSeats, setPreviewSeats] = useState([]);
  
  const { id } = useParams(); // ID del concierto
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const tiposZona = [
    "VIP", "Preferencial", "General", "Palco", "Tribuna", "Balcón"
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Primero intentamos cargar el concierto
      const conciertoData = await conciertoService.getConciertoById(id);
      setConcierto(conciertoData);
      
      try {
        // Intentamos cargar las zonas, pero si no hay no lo consideramos un error crítico
        const zonasData = await conciertoService.getZonasByConcierto(id);
        setZonas(zonasData || []);
      } catch (zonaErr) {
        // Si ocurre un error al cargar zonas, simplemente inicializamos con un array vacío
        console.log('No se encontraron zonas para este concierto:', zonaErr);
        setZonas([]);
      }
    } catch (err) {
      // Solo consideramos error crítico si no se puede cargar el concierto
      console.error('Error loading concierto data:', err);
      setMessage({ 
        type: "error", 
        text: "Error al cargar los datos del concierto. Regresando a la lista..." 
      });
      setTimeout(() => navigate('/admin/conciertos'), 2000);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    // Verificar que el usuario sea admin
    if (!isAuthenticated || user?.rol !== 'admin') {
      navigate('/');
      return;
    }
    
    loadData();
  }, [isAuthenticated, user, navigate, loadData]);

  // Efecto para actualizar la vista previa de asientos cuando cambie capacidad o layout
  useEffect(() => {
    if (showCreateModal && formData.capacidad) {
      const seats = generateSeatPreview(formData.capacidad, layoutType);
      setPreviewSeats(seats);
    }
  }, [formData.capacidad, layoutType, showCreateModal]);

  // Determinar tipo de layout basado en el nombre de la zona
  const determineLayoutType = (zonaNombre) => {
    if (!zonaNombre) return "recto";
    
    zonaNombre = zonaNombre.toLowerCase();
    
    // Configuración específica por tipo de zona
    if (zonaNombre === "general" || zonaNombre === "palco") {
      return "circular";
    }
    
    if (zonaNombre === "vip" || zonaNombre === "preferencial") {
      return "recto";
    }
    
    // Para otros casos, usar reglas genéricas
    const zonasCirculares = ["tribuna", "balcón", "balcon"];
    
    // Verificar si el nombre de la zona incluye alguna palabra clave
    for (const tipo of zonasCirculares) {
      if (zonaNombre.includes(tipo)) {
        return "circular";
      }
    }
    
    // Por defecto, layout recto
    return "recto";
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    setFormData(updatedFormData);
    
    // Si cambia el nombre, actualizar automáticamente el tipo de layout según la zona
    if (name === 'nombre' && value) {
      const suggestedLayoutType = determineLayoutType(value);
      console.log(`Tipo de layout para ${value}: ${suggestedLayoutType}`);
      
      // Siempre actualizar el layout según el tipo de zona seleccionada
      setLayoutType(suggestedLayoutType);
    }
    
    // Limpiar error específico
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    
    // Actualizar vista previa de asientos si cambia la capacidad
    if (name === 'capacidad') {
      const newSeats = generateSeatPreview(value, layoutType);
      setPreviewSeats(newSeats);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre de la zona es obligatorio";
    }
    
    if (!formData.capacidad || formData.capacidad <= 0) {
      newErrors.capacidad = "La capacidad debe ser mayor a 0";
    } else if (formData.capacidad > 10000) {
      newErrors.capacidad = "La capacidad no puede exceder 10,000 asientos";
    }
    
    if (!formData.precio || formData.precio <= 0) {
      newErrors.precio = "El precio debe ser mayor a 0";
    }

    // Verificar si ya existe una zona con el mismo nombre (solo al crear)
    if (!editingZona && zonas.some(zona => zona.nombre.toLowerCase() === formData.nombre.toLowerCase())) {
      newErrors.nombre = "Ya existe una zona con este nombre";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoadingAction(true);

    try {
      const zonaData = {
        concierto_id: id,
        nombre: formData.nombre,
        capacidad: parseInt(formData.capacidad),
        precio: parseFloat(formData.precio)
      };

      if (editingZona) {
        await conciertoService.updateZona(editingZona.id, zonaData);
        setMessage({ type: "success", text: "Zona actualizada exitosamente" });
      } else {
        await conciertoService.createZona(zonaData);
        setMessage({ type: "success", text: "Zona creada exitosamente" });
      }
      
      // Recargar zonas
      const zonasData = await conciertoService.getZonasByConcierto(id);
      setZonas(zonasData);
      
      // Limpiar formulario y cerrar modal
      resetForm();
      
    } catch (err) {
      console.error('Error saving zona:', err);
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || `Error al ${editingZona ? 'actualizar' : 'crear'} la zona` 
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteZona = async () => {
    if (!zonaToDelete) return;

    // Verificar que no sea la última zona - permitir la eliminación cuando hay 1 zona para empezar de nuevo
    if (zonas.length === 1) {
      setLoadingAction(true);
      try {
        await conciertoService.deleteZona(zonaToDelete.id);
        setMessage({ type: "success", text: "Zona eliminada exitosamente" });
        
        // Recargar zonas (será un array vacío)
        setZonas([]);
        
        setShowDeleteModal(false);
        setZonaToDelete(null);
      } catch (err) {
        console.error('Error deleting zona:', err);
        setMessage({ 
          type: "error", 
          text: err.response?.data?.message || "Error al eliminar la zona" 
        });
      } finally {
        setLoadingAction(false);
      }
      return;
    }
    
    // Para el caso donde hay más zonas, verificar que no queden menos de 2
    if (zonas.length <= 2) {
      setMessage({ 
        type: "error", 
        text: "No se puede eliminar. Debe haber al menos 2 zonas en el concierto." 
      });
      setShowDeleteModal(false);
      return;
    }

    setLoadingAction(true);
    try {
      await conciertoService.deleteZona(zonaToDelete.id);
      setMessage({ type: "success", text: "Zona eliminada exitosamente" });
      
      // Recargar zonas
      const zonasData = await conciertoService.getZonasByConcierto(id);
      setZonas(zonasData);
      
      setShowDeleteModal(false);
      setZonaToDelete(null);
    } catch (err) {
      console.error('Error deleting zona:', err);
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Error al eliminar la zona" 
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: "", capacidad: "", precio: "" });
    setLayoutType("recto");
    setErrors({});
    setEditingZona(null);
    setPreviewSeats([]);
    setShowCreateModal(false);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (zona) => {
    const updatedFormData = {
      nombre: zona.nombre,
      capacidad: zona.capacidad.toString(),
      precio: zona.precio.toString()
    };
    
    // Determinar tipo de layout basado en el nombre
    const calculatedLayoutType = determineLayoutType(zona.nombre);
    
    setFormData(updatedFormData);
    setLayoutType(calculatedLayoutType);
    setEditingZona(zona);
    
    // Primero abrir el modal para que los cálculos de posicionamiento funcionen correctamente
    setShowCreateModal(true);
    
    // Usar setTimeout para asegurar que el modal esté renderizado antes de generar los asientos
    setTimeout(() => {
      // Generar vista previa de asientos
      const seats = generateSeatPreview(zona.capacidad, calculatedLayoutType);
      setPreviewSeats(seats);
    }, 100);
  };

  const confirmDelete = (zona) => {
    setZonaToDelete(zona);
    setShowDeleteModal(true);
  };

// Suma la capacidad total de todas las zonas
const getTotalCapacidad = () => {
    return zonas.reduce((total, zona) => total + (parseInt(zona.capacidad) || 0), 0);
};

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Función para generar la vista previa de asientos
  const generateSeatPreview = (capacidad, layoutType) => {
    if (!capacidad || capacidad <= 0) return [];
    
    const seatCount = Math.min(parseInt(capacidad), 500); // Limitar la vista previa a 500 asientos
    let seats = [];
    
    if (layoutType === "recto") {
      // Para layout recto, organizar en filas de 10-15 asientos
      const seatsPerRow = 15;
      const rows = Math.ceil(seatCount / seatsPerRow);
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < seatsPerRow; col++) {
          const seatNumber = row * seatsPerRow + col + 1;
          if (seatNumber <= seatCount) {
            seats.push({
              id: `seat-${seatNumber}`,
              row: String.fromCharCode(65 + row), // A, B, C, etc.
              number: col + 1,
              x: col,
              y: row,
              status: 'disponible' // Por defecto todos los asientos están disponibles
            });
          }
        }
      }
    } else {
      // Para layout circular (semicírculo/anfiteatro)
      const totalRows = 5; // Número de filas en semicírculo
      const middleX = 150; // Centro del semicírculo (eje X)
      let seatsLeft = seatCount;
      
      // Distribución optimizada de asientos por fila (más en filas traseras)
      // La suma debe ser cercana a 1 (100%)
      const distribution = [0.10, 0.15, 0.2, 0.25, 0.3];
      
      // Calcular cuántos asientos por fila basado en la distribución
      const rowDistribution = distribution.map(percent => 
        Math.max(3, Math.min(15, Math.floor(seatCount * percent)))
      );
      
      let currentSeat = 1;
      
      // Para cada fila en el anfiteatro
      for (let row = 0; row < Math.min(totalRows, rowDistribution.length); row++) {
        const seatsInRow = Math.min(rowDistribution[row], seatsLeft);
        if (seatsInRow <= 0) break;
        
        // Distribuir asientos en arco de 140 grados (más concentrados para evitar superposición)
        const arcAngle = (7 * Math.PI) / 9; // ~140 grados
        const angleIncrement = arcAngle / (seatsInRow - 1 || 1); // Evitar división por cero
        
        // Aumentar el radio por cada fila con mayor espacio entre filas
        const radius = 70 + row * 35; // Mayor incremento entre filas para evitar superposición
        const startAngle = Math.PI / 2 - arcAngle / 2; // Comenzar desde la izquierda
        
        for (let i = 0; i < seatsInRow && seatsLeft > 0; i++) {
          // Para filas con un solo asiento, colocarlo en el centro
          const angle = seatsInRow === 1 
            ? Math.PI / 2  // 90 grados (centro)
            : startAngle + angleIncrement * i;
            
          // Calcular posición X,Y basado en el ángulo y radio
          // Usar Math.round para evitar posiciones fraccionales que pueden causar problemas visuales
          const x = Math.round(middleX + Math.cos(angle) * radius);
          const y = 35 + row * 35; // Más espacio vertical entre filas (35px)
          
          seats.push({
            id: `seat-${currentSeat}`,
            row: String.fromCharCode(65 + row),
            number: i + 1,
            x: x,
            y: y,
            status: 'disponible'
          });
          
          currentSeat++;
          seatsLeft--;
        }
      }
    }
    
    return seats;
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando datos...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => navigate('/admin/conciertos')}
            className="mb-2"
          >
            <i className="bi bi-arrow-left me-1"></i>
            Volver a Conciertos
          </Button>
          <h2 style={{ color: "#ff4081" }}>
            <i className="bi bi-grid-3x3-gap me-2"></i>
            Gestión de Zonas
          </h2>
          <h5 style={{ color: "#00bcd4" }}>{concierto?.nombre}</h5>
        </div>
        <Button
          style={{
            background: "linear-gradient(90deg, #ff4081, #673ab7)",
            border: "none",
          }}
          onClick={openCreateModal}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Crear Nueva Zona
        </Button>
      </div>

      {message.text && (
        <Alert 
          variant={message.type === "success" ? "success" : "danger"}
          dismissible
          onClose={() => setMessage({ type: "", text: "" })}
        >
          {message.text}
        </Alert>
      )}

      {/* Información del concierto */}
      <Row className="mb-4">
        <Col md={12}>
          <Card style={{ backgroundColor: "#111", color: "#fff" }}>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <strong>Fecha:</strong><br />
                  {new Date(concierto?.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Col>
                <Col md={3}>
                  <strong>Lugar:</strong><br />
                  {concierto?.lugar}
                </Col>
                <Col md={3}>
                  <strong>Ciudad:</strong><br />
                  {concierto?.ciudad}
                </Col>
                <Col md={3}>
                  <strong>Total Capacidad:</strong><br />
                  <Badge bg="info" className="fs-6">
                    {getTotalCapacidad().toLocaleString()} asientos
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de zonas */}
      <Card style={{ backgroundColor: "#111", color: "#fff" }}>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>
            Zonas Configuradas ({zonas.length})
          </h5>
        </Card.Header>
        <Card.Body>
          {zonas.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-grid-3x3-gap" style={{ fontSize: "3rem", color: "#4a90e2" }}></i>
              <p className="mt-3" style={{ color: "#ffffff" }}>
                No hay zonas configuradas para este concierto
              </p>
              <Button
                variant="outline-light"
                onClick={openCreateModal}
              >
                Crear Primera Zona
              </Button>
            </div>
          ) : (
            <Table responsive hover variant="dark">
              <thead>
                <tr>
                  <th>Zona</th>
                  <th>Capacidad</th>
                  <th>Precio</th>
                  <th>Ingresos Potenciales</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {zonas.map((zona) => (
                  <tr key={zona.id}>
                    <td>
                      <strong style={{ color: "#00bcd4" }}>
                        {zona.nombre}
                      </strong>
                    </td>
                    <td>
                      <Badge bg="secondary">
                        {zona.capacidad.toLocaleString()} asientos
                      </Badge>
                    </td>
                    <td>{formatPrice(zona.precio)}</td>
                    <td>
                      <strong style={{ color: "#4caf50" }}>
                        {formatPrice(zona.capacidad * zona.precio)}
                      </strong>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => openEditModal(zona)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => confirmDelete(zona)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal para crear/editar zona */}
      <Modal show={showCreateModal} onHide={resetForm} size="xl" dialogClassName="modal-90w">
        <Modal.Header closeButton style={{ backgroundColor: "#333", color: "#fff" }}>
          <Modal.Title>
            {editingZona ? 'Editar Zona' : 'Crear Nueva Zona'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ backgroundColor: "#333", color: "#fff" }}>
            <Tabs
              defaultActiveKey="detalles"
              className="mb-3"
              style={{ borderBottom: "1px solid #555" }}
            >
              <Tab eventKey="detalles" title="Detalles de la Zona">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre de la Zona *</Form.Label>
                      <Form.Select
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        isInvalid={!!errors.nombre}
                        style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
                      >
                        <option value="">Selecciona un tipo de zona</option>
                        {tiposZona.map(tipo => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.nombre}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Capacidad (máx. 10,000) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="capacidad"
                        value={formData.capacidad}
                        onChange={handleChange}
                        isInvalid={!!errors.capacidad}
                        min="1"
                        max="10000"
                        placeholder="Ej: 100"
                        style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.capacidad}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Precio (USD) *</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}>
                          $
                        </InputGroup.Text>
                        <Form.Control
                          type="number"
                          name="precio"
                          value={formData.precio}
                          onChange={handleChange}
                          isInvalid={!!errors.precio}
                          min="0.01"
                          step="0.01"
                          placeholder="Ej: 50.00"
                          style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.precio}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ingresos Potenciales</Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          formData.capacidad && formData.precio 
                            ? formatPrice(parseFloat(formData.capacidad) * parseFloat(formData.precio))
                            : "$0.00"
                        }
                        readOnly
                        style={{ backgroundColor: "#1a1a1a", color: "#4caf50", border: "1px solid #444" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Distribución de asientos</Form.Label>
                      <div className="d-flex align-items-center mb-2">
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="layoutType"
                            id="layoutRecto"
                            value="recto"
                            checked={layoutType === "recto"}
                            onChange={() => setLayoutType("recto")}
                            style={{ cursor: "pointer" }}
                          />
                          <label className="form-check-label" htmlFor="layoutRecto" style={{ cursor: "pointer" }}>
                            <Badge bg="info" className="me-1">Recta</Badge>
                            <small>Filas paralelas</small>
                          </label>
                        </div>
                        <div className="form-check form-check-inline ms-3">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="layoutType"
                            id="layoutCircular"
                            value="circular"
                            checked={layoutType === "circular"}
                            onChange={() => setLayoutType("circular")}
                            style={{ cursor: "pointer" }}
                          />
                          <label className="form-check-label" htmlFor="layoutCircular" style={{ cursor: "pointer" }}>
                            <Badge bg="warning" className="me-1">Semicircular</Badge>
                            <small>Anfiteatro</small>
                          </label>
                        </div>
                      </div>
                      <div className="p-2 rounded" style={{ backgroundColor: "#222", border: "1px solid #444" }}>
                        {layoutType === "circular" ? (
                          <span style={{ color: "#ffffff" }}>
                            <i className="bi bi-info-circle me-1"></i>
                            Distribución semicircular tipo anfiteatro (configurado para General y Palco)
                          </span>
                        ) : (
                          <span style={{ color: "#ffffff" }}>
                            <i className="bi bi-info-circle me-1"></i>
                            Distribución en filas rectas (configurado para VIP y Preferencial)
                          </span>
                        )}
                      </div>
                      <Form.Text style={{ color: "#b0b0b0" }}>
                        El tipo de zona seleccionado determinará automáticamente la distribución de asientos.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="preview" title="Vista previa de asientos">
                <div className="seat-preview-container" style={{ padding: "20px", backgroundColor: "#222", borderRadius: "8px", minHeight: "350px", overflowX: "auto" }}>
                  {formData.capacidad && parseInt(formData.capacidad) > 0 ? (
                    <>
                      <div className="mb-3 pb-2 border-bottom border-secondary d-flex justify-content-between align-items-center">
                        <div>
                          <h5 style={{ color: "#00bcd4" }}>
                            Vista previa: {formData.nombre || 'Zona sin nombre'}
                          </h5>
                          <Badge bg="info">
                            {parseInt(formData.capacidad).toLocaleString()} asientos
                          </Badge>
                          <Badge bg="warning" className="ms-2">
                            Distribución {layoutType === "recto" ? "recta" : "semicircular"}
                          </Badge>
                        </div>
                        <div>
                          <Badge bg="success" className="p-2">
                            <i className="bi bi-square-fill" style={{ color: "#4caf50" }}></i> Disponible
                          </Badge>
                        </div>
                      </div>
                      
                      <div className={`seat-layout ${formData.layoutType === "circular" ? "circular-layout" : ""}`} style={{ marginBottom: "20px" }}>
                        {/* Pantalla o escenario */}
                        <div className="screen" style={{ 
                          backgroundColor: "#333", 
                          padding: layoutType === "circular" ? "15px" : "12px", 
                          textAlign: "center", 
                          marginBottom: "30px",
                          borderRadius: layoutType === "circular" ? "50% 50% 0 0" : "5px",
                          width: layoutType === "circular" ? "80%" : "100%",
                          maxWidth: "600px",
                          margin: "0 auto 30px",
                          border: "1px solid #555",
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "14px",
                          boxShadow: "0 2px 10px rgba(0, 188, 212, 0.3)"
                        }}>
                          <i className="bi bi-music-note-beamed me-2"></i>
                          ESCENARIO
                        </div>
                        
                        {/* Indicador del tipo de vista */}
                        <div style={{
                          textAlign: "center",
                          color: layoutType === "circular" ? "#00bcd4" : "#ff4081",
                          fontSize: "13px",
                          marginBottom: "10px",
                          fontWeight: "bold",
                          backgroundColor: "rgba(0,0,0,0.2)",
                          padding: "3px",
                          borderRadius: "5px",
                          maxWidth: "200px",
                          margin: "0 auto 10px"
                        }}>
                          Vista {layoutType === "circular" ? "Semicircular" : "Recta"}
                        </div>
                      
                        {/* Contenedor de asientos */}
                        <div style={{ 
                          display: "flex", 
                          flexDirection: "column", 
                          alignItems: "center", 
                          maxHeight: "400px", 
                          overflowY: "auto",
                          position: "relative"
                        }}>
                          <div style={{ 
                            display: "flex", 
                            flexWrap: "wrap", 
                            justifyContent: layoutType === "circular" ? "center" : "flex-start",
                            maxWidth: "95%",
                            margin: "0 auto"
                          }}>
                            {layoutType === "recto" ? (
                              // Layout recto - mostrar filas de asientos
                              <div style={{ marginTop: "15px" }}>
                                {previewSeats.length > 0 && Array.from(new Set(previewSeats.map(seat => seat.row))).map(row => (
                                  <div key={row} style={{ 
                                    width: "100%", 
                                    display: "flex", 
                                    justifyContent: "center", 
                                    marginBottom: "10px"
                                  }}>
                                    <span style={{ 
                                      marginRight: "15px", 
                                      minWidth: "25px", 
                                      textAlign: "center", 
                                      background: "#555", 
                                      borderRadius: "50%",
                                      padding: "3px 0",
                                      color: "#fff",
                                      fontWeight: "bold"
                                    }}>{row}</span>
                                    {previewSeats
                                      .filter(seat => seat.row === row)
                                      .map(seat => (
                                        <div
                                          key={seat.id}
                                          style={{
                                            width: "22px",
                                            height: "22px",
                                            margin: "0 2px",
                                            backgroundColor: "#4caf50",
                                            borderRadius: "3px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "10px",
                                            fontWeight: "bold",
                                            color: "#000",
                                            boxShadow: "0 2px 2px rgba(0,0,0,0.2)",
                                            cursor: "default"
                                          }}
                                          title={`${seat.row}${seat.number}`}
                                        >
                                          {seat.number}
                                        </div>
                                      ))}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              // Layout circular - mostrar asientos en semicírculo
                              <div style={{ 
                                position: "relative", 
                                width: "100%", 
                                height: "300px", // Más altura para acomodar más filas
                                marginTop: "20px",
                                overflow: "visible",
                                background: "linear-gradient(to bottom, #1a2a3a, #0d1521)",
                                borderRadius: "8px",
                                border: "1px solid #4a90e2",
                                boxShadow: "inset 0 0 20px rgba(74, 144, 226, 0.3)"
                              }}>
                                {/* Marcadores de filas */}
                                {Array.from(new Set(previewSeats.map(seat => seat.row))).map(row => {
                                  // Encontrar el primer asiento de esta fila
                                  const firstSeatInRow = previewSeats.find(seat => seat.row === row);
                                  if (!firstSeatInRow) return null;
                                  
                                  return (
                                    <div 
                                      key={`row-${row}`}
                                      style={{
                                        position: "absolute",
                                        left: "10px",
                                        top: `${firstSeatInRow.y}px`,
                                        zIndex: 10,
                                        background: "linear-gradient(135deg, #00bcd4, #007c91)",
                                        color: "#fff",
                                        borderRadius: "50%",
                                        width: "24px",
                                        height: "24px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "bold",
                                        fontSize: "13px",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.7)",
                                        border: "1px solid #00e5ff",
                                        textShadow: "0px 1px 2px rgba(0,0,0,0.5)"
                                      }}
                                    >
                                      {row}
                                    </div>
                                  );
                                })}
                              
                                {/* Asientos en semicírculo */}
                                {previewSeats.map(seat => (
                                  <div
                                    key={seat.id}
                                    style={{
                                      position: "absolute",
                                      left: `${seat.x}px`,
                                      top: `${seat.y}px`,
                                      width: "20px", // Tamaño un poco mayor
                                      height: "20px",
                                      backgroundColor: "#4caf50",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: seat.number < 10 ? "11px" : "9px", // Tamaño de fuente adaptable
                                      fontWeight: "bold",
                                      color: "#000",
                                      boxShadow: "0 2px 5px rgba(0,0,0,0.7)",
                                      cursor: "default",
                                      border: "1px solid #45c65a",
                                      transition: "all 0.2s ease",
                                      zIndex: 5 // Asegurar que los asientos estén por encima de otros elementos
                                    }}
                                    title={`Fila ${seat.row} Asiento ${seat.number}`}
                                  >
                                    {seat.number}
                                  </div>
                                ))}
                                
                                {/* Escenario */}
                                <div style={{
                                  position: "absolute",
                                  bottom: "10px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  width: "70%",
                                  height: "35px",
                                  background: "linear-gradient(180deg, #673ab7, #4a148c)",
                                  border: "1px solid #9c27b0",
                                  borderRadius: "100px 100px 0 0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#fff",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  boxShadow: "0 -2px 15px rgba(156, 39, 176, 0.7)"
                                }}>
                                  <i className="bi bi-music-note-beamed me-2"></i>
                                  ESCENARIO
                                </div>
                                
                                {/* Indicador central */}
                              
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {parseInt(formData.capacidad) > 200 && (
                          <div className="text-center mt-3" style={{ color: "#b0b0b0" }}>
                            <small>Mostrando vista previa. La zona tendrá {parseInt(formData.capacidad).toLocaleString()} asientos en total.</small>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-info-circle" style={{ fontSize: "3rem", color: "#4a90e2" }}></i>
                      <p className="mt-3" style={{ color: "#ffffff" }}>
                        Complete la información de la zona y especifique la capacidad para visualizar los asientos
                      </p>
                    </div>
                  )}
                </div>
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: "#333" }}>
            <Button variant="secondary" onClick={resetForm}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={loadingAction}
              style={{
                background: "linear-gradient(90deg, #ff4081, #673ab7)",
                border: "none"
              }}
            >
              {loadingAction ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  {editingZona ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <i className={`bi ${editingZona ? 'bi-check-circle' : 'bi-plus-circle'} me-1`}></i>
                  {editingZona ? 'Actualizar Zona' : 'Crear Zona'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: "#333", color: "#fff" }}>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#333", color: "#fff" }}>
          <p>¿Estás seguro de que deseas eliminar la zona:</p>
          <strong style={{ color: "#ff4081" }}>
            {zonaToDelete?.nombre}
          </strong>
          <p className="mt-2 text-warning">
            <i className="bi bi-exclamation-triangle me-1"></i>
            Esta acción eliminará todos los asientos de esta zona y no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#333" }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteZona}
            disabled={loadingAction}
          >
            {loadingAction ? (
              <>
                <Spinner size="sm" className="me-2" />
                Eliminando...
              </>
            ) : (
              "Eliminar Zona"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GestionarZonas;
