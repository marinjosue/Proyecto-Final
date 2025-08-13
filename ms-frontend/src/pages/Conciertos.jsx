import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Row, Col, Spinner, Alert, Form, InputGroup, Dropdown } from "react-bootstrap";
import { conciertoService } from "../services/api";

const Conciertos = () => {
  const [conciertos, setConciertos] = useState([]);
  const [filteredConciertos, setFilteredConciertos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    ciudad: "",
    categoria: "",
    fecha: ""
  });
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadConciertos();
  }, []);

  useEffect(() => {
    // Apply filters whenever filters or conciertos change
    applyFilters();
  }, [filters, conciertos, searchTerm]);

  // Extract unique cities and categories
  useEffect(() => {
    if (conciertos.length > 0) {
      const cities = [...new Set(conciertos.map(c => c.ciudad))];
      const categories = [...new Set(conciertos.map(c => c.categoria))];
      setUniqueCities(cities);
      setUniqueCategories(categories);
    }
  }, [conciertos]);

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
  
  const applyFilters = () => {
    let result = [...conciertos];
    
    // Apply search term
    if (searchTerm.trim() !== "") {
      result = result.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lugar.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply city filter
    if (filters.ciudad) {
      result = result.filter(c => c.ciudad === filters.ciudad);
    }
    
    // Apply category filter
    if (filters.categoria) {
      result = result.filter(c => c.categoria === filters.categoria);
    }
    
    // Apply date filter
    if (filters.fecha) {
      // Convert filter date to YYYY-MM-DD for comparison
      const filterDate = new Date(filters.fecha).toISOString().split('T')[0];
      
      result = result.filter(c => {
        // Convert concert date to YYYY-MM-DD
        const concertDate = new Date(c.fecha).toISOString().split('T')[0];
        return concertDate === filterDate;
      });
    }
    
    setFilteredConciertos(result);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      ciudad: "",
      categoria: "",
      fecha: ""
    });
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando conciertos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
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
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h3 className="text-center mb-4" style={{ color: "#ff4081" }}>
        🎤 Próximos Conciertos
      </h3>
      
      {/* Filtros y Búsqueda */}
      <div className="mb-4 p-3" style={{ backgroundColor: "#111", borderRadius: "15px" }}>
        <Row className="mb-3">
          <Col md={8}>
            <InputGroup>
              <Form.Control 
                placeholder="Buscar por nombre o lugar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
              />
              <Button 
                variant="outline-secondary"
                onClick={() => setSearchTerm("")}
              >
                Limpiar
              </Button>
            </InputGroup>
          </Col>
          <Col md={4} className="d-flex justify-content-end">
            <Button 
              variant="outline-light" 
              onClick={clearFilters}
              size="sm"
            >
              Limpiar filtros
            </Button>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ color: "#fff" }}>Ciudad</Form.Label>
              <Form.Select 
                value={filters.ciudad}
                onChange={(e) => handleFilterChange("ciudad", e.target.value)}
                style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
              >
                <option value="">Todas las ciudades</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ color: "#fff" }}>Categoría</Form.Label>
              <Form.Select 
                value={filters.categoria}
                onChange={(e) => handleFilterChange("categoria", e.target.value)}
                style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
              >
                <option value="">Todas las categorías</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ color: "#fff" }}>Fecha</Form.Label>
              <Form.Control 
                type="date" 
                value={filters.fecha}
                onChange={(e) => handleFilterChange("fecha", e.target.value)}
                style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
          </Col>
        </Row>
      </div>
      
      {/* Resultados */}
      {filteredConciertos.length === 0 ? (
        <div className="text-center p-4" style={{ backgroundColor: "#111", borderRadius: "15px" }}>
          <p className="text-light">No se encontraron conciertos con los filtros seleccionados.</p>
          <Button 
            variant="outline-light"
            onClick={clearFilters}
          >
            Limpiar filtros para ver todos los conciertos
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-light mb-3">Se encontraron {filteredConciertos.length} concierto(s)</p>
          <Row>
            {filteredConciertos.map((concierto) => (
              <Col md={4} key={concierto.id} className="mb-4">
                <Card
                  style={{
                    backgroundColor: "#111",
                    color: "#fff",
                    borderRadius: "15px",
                  }}
                  className="shadow-lg h-100"
                >
                  <Card.Body className="d-flex flex-column">
                    <Card.Title style={{ color: "#00bcd4" }}>
                      {concierto.nombre}
                    </Card.Title>
                    <Card.Text>
                      <strong>Categoría:</strong> <span className="badge bg-secondary">{concierto.categoria}</span> <br />
                      <strong>Ciudad:</strong> {concierto.ciudad} <br />
                      <strong>Fecha:</strong> {new Date(concierto.fecha).toLocaleDateString()} <br />
                      <strong>Lugar:</strong> {concierto.lugar}
                    </Card.Text>
                    <div className="mt-auto">
                      <Link to={`/conciertos/${concierto.id}`} className="me-2">
                        <Button
                          style={{
                            background: "linear-gradient(90deg, #ff4081, #673ab7)",
                            border: "none",
                            marginRight: "10px",
                          }}
                        >
                          Ver más
                        </Button>
                      </Link>
                      <Link to={`/conciertos/${concierto.id}`}>
                        <Button
                          style={{
                            background: "linear-gradient(90deg, #673ab7, #00bcd4)",
                            border: "none",
                          }}
                        >
                          Comprar Ticket
                        </Button>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default Conciertos;
