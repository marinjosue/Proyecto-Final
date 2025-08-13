import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Spinner, 
  Alert, 
  Modal,
  Badge,
  Form,
  InputGroup
} from "react-bootstrap";
import { conciertoService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const AdminConciertos = () => {
  const [conciertos, setConciertos] = useState([]);
  const [filteredConciertos, setFilteredConciertos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conciertoToDelete, setConciertoToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar que el usuario sea admin
    if (!isAuthenticated || user?.rol !== 'admin') {
      navigate('/');
      return;
    }
    
    loadConciertos();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Filtrar conciertos cuando cambie el término de búsqueda
    if (searchTerm.trim() === "") {
      setFilteredConciertos(conciertos);
    } else {
      const filtered = conciertos.filter(concierto =>
        concierto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concierto.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concierto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConciertos(filtered);
    }
  }, [searchTerm, conciertos]);

  const loadConciertos = async () => {
    try {
      setLoading(true);
      const data = await conciertoService.getConciertos();
      setConciertos(data);
      setFilteredConciertos(data);
      setError(null);
    } catch (err) {
      console.error('Error loading conciertos:', err);
      setError('Error al cargar los conciertos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConcierto = async (id) => {
    try {
      await conciertoService.deleteConcierto(id);
      setMessage({ type: "success", text: "Concierto eliminado exitosamente" });
      loadConciertos();
      setShowDeleteModal(false);
      setConciertoToDelete(null);
    } catch (err) {
      console.error('Error deleting concierto:', err);
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Error al eliminar el concierto" 
      });
    }
  };

  const confirmDelete = (concierto) => {
    setConciertoToDelete(concierto);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando conciertos...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: "#ff4081" }}>
          <i className="bi bi-music-note-list me-2"></i>
          Administración de Conciertos
        </h2>
        <Button
          style={{
            background: "linear-gradient(90deg, #ff4081, #673ab7)",
            border: "none",
          }}
          onClick={() => navigate('/admin/conciertos/crear')}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Crear Nuevo Concierto
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

      {error && (
        <Alert variant="danger">
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-2"
            onClick={loadConciertos}
          >
            Reintentar
          </Button>
        </Alert>
      )}

      {/* Barra de búsqueda */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar por nombre, ciudad o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary"
                onClick={() => setSearchTerm("")}
              >
                Limpiar
              </Button>
            )}
          </InputGroup>
        </Col>
        <Col md={6} className="text-end">
          <Badge bg="info" className="fs-6">
            Total: {filteredConciertos.length} concierto(s)
          </Badge>
        </Col>
      </Row>

      {/* Tabla de conciertos */}
      <Card style={{ backgroundColor: "#111", color: "#fff" }}>
        <Card.Body>
          {filteredConciertos.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-music-note-beamed" style={{ fontSize: "3rem", color: "#666" }}></i>
              <p className="mt-3 text-muted">
                {searchTerm ? "No se encontraron conciertos con esos criterios" : "No hay conciertos creados aún"}
              </p>
              {!searchTerm && (
                <Button
                  variant="outline-light"
                  onClick={() => navigate('/admin/conciertos/crear')}
                >
                  Crear Primer Concierto
                </Button>
              )}
            </div>
          ) : (
            <Table responsive hover variant="dark">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha</th>
                  <th>Ciudad</th>
                  <th>Categoría</th>
                  <th>Lugar</th>
                  <th>Zonas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredConciertos.map((concierto) => (
                  <tr key={concierto.id}>
                    <td>
                      <strong style={{ color: "#00bcd4" }}>
                        {concierto.nombre}
                      </strong>
                    </td>
                    <td>{formatDate(concierto.fecha)}</td>
                    <td>{concierto.ciudad}</td>
                    <td>
                      <Badge bg="secondary">{concierto.categoria}</Badge>
                    </td>
                    <td>{concierto.lugar}</td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => navigate(`/admin/conciertos/${concierto.id}/zonas`)}
                      >
                        <i className="bi bi-grid-3x3-gap me-1"></i>
                        Gestionar
                      </Button>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => navigate(`/admin/conciertos/${concierto.id}/editar`)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => confirmDelete(concierto)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/conciertos/${concierto.id}`)}
                        >
                          <i className="bi bi-eye"></i>
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

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: "#333", color: "#fff" }}>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#333", color: "#fff" }}>
          <p>¿Estás seguro de que deseas eliminar el concierto:</p>
          <strong style={{ color: "#ff4081" }}>
            {conciertoToDelete?.nombre}
          </strong>
          <p className="mt-2 text-warning">
            <i className="bi bi-exclamation-triangle me-1"></i>
            Esta acción no se puede deshacer y eliminará todas las zonas asociadas.
          </p>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#333" }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleDeleteConcierto(conciertoToDelete.id)}
          >
            Eliminar Concierto
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminConciertos;
