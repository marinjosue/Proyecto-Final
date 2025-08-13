import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button, Spinner, Alert, Card, Row, Col, Form, Badge, Modal, Tab, Tabs } from "react-bootstrap";
import { conciertoService, reservaService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ConciertoDetalle = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [concierto, setConcierto] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedZona, setSelectedZona] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [asientosDisponibles, setAsientosDisponibles] = useState({});

  useEffect(() => {
    loadConcierto();
    
    // Check for pending purchase after login
    if (isAuthenticated) {
      const pendingPurchase = localStorage.getItem('pending_purchase');
      if (pendingPurchase) {
        try {
          const purchase = JSON.parse(pendingPurchase);
          if (purchase.conciertoId === id) {
            setSelectedZona(purchase.zonaId);
            setCantidad(purchase.cantidad);
            
            // Clear pending purchase once recovered
            localStorage.removeItem('pending_purchase');
            
            setMessage({ 
              type: "info", 
              text: "Has iniciado sesión correctamente. Puedes continuar con tu compra." 
            });
          }
        } catch (error) {
          console.error("Error al recuperar compra pendiente:", error);
          localStorage.removeItem('pending_purchase');
        }
      }
    }
  }, [id, isAuthenticated]);

  // Simular asientos disponibles (en una implementación real vendría del backend)
  useEffect(() => {
    if (zonas.length > 0) {
      const disponibles = {};
      zonas.forEach(zona => {
        // Simular que hay entre 70% y 95% de asientos disponibles
        const porcentajeDisponible = 0.7 + Math.random() * 0.25;
        disponibles[zona.id] = Math.floor(zona.capacidad * porcentajeDisponible);
      });
      setAsientosDisponibles(disponibles);
    }
  }, [zonas]);

  const loadConcierto = async () => {
    try {
      setLoading(true);
      const [conciertoData, zonasData] = await Promise.all([
        conciertoService.getConciertoById(id),
        conciertoService.getZonasByConcierto(id)
      ]);
      
      setConcierto(conciertoData);
      setZonas(zonasData);
      if (zonasData.length > 0) {
        setSelectedZona(zonasData[0].id);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading concierto:', err);
      setError('Error al cargar el concierto. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleComprarTicket = async () => {
    if (!isAuthenticated) {
      // Guardar en localStorage los datos del concierto y zona para recuperar después de login
      localStorage.setItem('pending_purchase', JSON.stringify({
        conciertoId: id,
        zonaId: selectedZona,
        cantidad: parseInt(cantidad)
      }));
      
      // Redireccionar al login
      navigate('/login', { 
        state: { 
          redirectUrl: `/conciertos/${id}`,
          message: "Inicia sesión para comprar tickets" 
        } 
      });
      return;
    }

    if (!selectedZona) {
      setMessage({ 
        type: "error", 
        text: "Debes seleccionar una zona" 
      });
      return;
    }

    try {
      setMessage({ type: "info", text: "Creando reserva..." });
      
      // Crear la reserva directamente
      const reservaData = {
        evento_id: id,
        zona_id: selectedZona,
        cantidad: parseInt(cantidad)
      };

      const reserva = await reservaService.createReserva(reservaData);
      
      setMessage({ 
        type: "success", 
        text: `¡Reserva creada exitosamente! ID: ${reserva.id}. Ve a "Mis Reservas" para confirmarla.` 
      });

      // Limpiar selección
      setSelectedZona("");
      setCantidad(1);
      
      // Opcional: Redireccionar a mis reservas después de 3 segundos
      setTimeout(() => {
        navigate('/mis-reservas');
      }, 3000);
      
    } catch (err) {
      console.error('Error creating reserva:', err);
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Error al crear la reserva. Intenta de nuevo." 
      });
    }
  };

  const getSelectedZonaInfo = () => {
    return zonas.find(z => z.id === selectedZona);
  };

  const getDisponibilidadColor = (zonaId) => {
    const disponibles = asientosDisponibles[zonaId] || 0;
    const zona = zonas.find(z => z.id === zonaId);
    if (!zona) return "secondary";
    
    const porcentaje = disponibles / zona.capacidad;
    if (porcentaje > 0.5) return "success";
    if (porcentaje > 0.2) return "warning";
    return "danger";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando concierto...</p>
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
            onClick={loadConcierto}
          >
            Reintentar
          </Button>
        </Alert>
      </div>
    );
  }

  if (!concierto) {
    return (
      <div className="container py-4 text-center">
        <h2>Concierto no encontrado</h2>
        <Link to="/conciertos">
          <Button variant="primary">Volver a Conciertos</Button>
        </Link>
      </div>
    );
  }

  // Determina el tipo de layout basado en el nombre de la zona
  const determineLayoutType = (zonaNombre) => {
    if (!zonaNombre) return "recto";
    
    zonaNombre = zonaNombre.toLowerCase();
    
    // Configuración específica por tipo de zona
    if (zonaNombre === "general" || zonaNombre === "palco") {
      return "semicircular";
    }
    
    if (zonaNombre === "vip" || zonaNombre === "preferencial") {
      return "recto";
    }
    
    // Para otros casos, usar reglas genéricas
    const zonasCirculares = ["tribuna", "balcón", "balcon"];
    
    // Verificar si el nombre de la zona incluye alguna palabra clave
    for (const tipo of zonasCirculares) {
      if (zonaNombre.includes(tipo)) {
        return "semicircular";
      }
    }
    
    // Por defecto, filas rectas
    return "recto";
  };

  // Genera asientos para previsualización
  const generatePreviewSeats = (zona) => {
    if (!zona) return [];
    
    const layoutType = determineLayoutType(zona.nombre);
    const capacidad = Math.min(zona.capacidad, 200); // Limitamos a 200 para la visualización
    let seats = [];
    
    if (layoutType === "recto") {
      // Layout recto - filas paralelas
      const seatsPerRow = 15;
      const rows = Math.ceil(capacidad / seatsPerRow);
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < seatsPerRow; col++) {
          const seatNumber = row * seatsPerRow + col + 1;
          if (seatNumber <= capacidad) {
            const isAvailable = seatNumber <= (asientosDisponibles[zona.id] || 0);
            seats.push({
              id: `seat-${seatNumber}`,
              row: String.fromCharCode(65 + row),
              number: col + 1,
              x: col,
              y: row,
              available: isAvailable
            });
          }
        }
      }
    } else {
      // Layout semicircular (anfiteatro)
      const totalRows = 5; // Número de filas en semicírculo
      const middleX = 14; // Centro del semicírculo (eje X) - ajustado para más espacio
      const baseY = 2; // Posición Y inicial - más espacio al principio
      let seatsLeft = capacidad;
      
      // Distribución optimizada de asientos por fila (más en filas traseras)
      // La suma debe ser cercana a 1 (100%)
      const distribution = [0.12, 0.16, 0.22, 0.24, 0.26];
      
      // Calcular cuántos asientos por fila basado en la distribución
      const rowDistribution = distribution.map(percent => 
        Math.max(3, Math.min(15, Math.floor(capacidad * percent)))
      );
      
      let currentSeat = 1;
      
      // Para cada fila en el anfiteatro
      for (let row = 0; row < Math.min(totalRows, rowDistribution.length); row++) {
        const seatsInRow = Math.min(rowDistribution[row], seatsLeft);
        if (seatsInRow <= 0) break;
        
        // Distribuir asientos en arco de 160 grados (más amplio)
        const arcAngle = (8 * Math.PI) / 9; // ~160 grados
        const angleIncrement = arcAngle / (seatsInRow - 1 || 1); // Evitar división por cero
        const radius = 4 + row * 2.5; // Mayor incremento del radio entre filas (más espacio)
        const startAngle = Math.PI / 2 - arcAngle / 2; // Comenzar desde la izquierda
        
        for (let i = 0; i < seatsInRow && seatsLeft > 0; i++) {
          // Para filas con un solo asiento, colocarlo en el centro
          const angle = seatsInRow === 1 
            ? Math.PI / 2  // 90 grados (centro)
            : startAngle + angleIncrement * i;
            
          // Calcular posición X,Y basado en el ángulo y radio
          // Usar valores con decimales para un mejor posicionamiento
          const x = middleX + Math.cos(angle) * radius;
          const y = baseY + row * 2.5; // Más espacio vertical entre filas
          
          // Determinar si el asiento está disponible
          const seatNumber = currentSeat;
          const isAvailable = seatNumber <= (asientosDisponibles[zona.id] || 0);
          
          seats.push({
            id: `seat-${seatNumber}`,
            row: String.fromCharCode(65 + row),
            number: i + 1,
            x: x,
            y: y,
            available: isAvailable
          });
          
          currentSeat++;
          seatsLeft--;
        }
      }
    }
    
    return seats;
  };

  return (
    <div
      className="container-fluid py-4"
      style={{
        background: "linear-gradient(135deg, #1a1a1a, #2b0052)",
        color: "#fff",
        minHeight: "100vh"
      }}
    >
      <div className="container">
        {/* Header mejorado */}
        <div className="row mb-4">
          <div className="col-12">
            <div 
              className="text-center p-4 rounded"
              style={{
                background: "linear-gradient(135deg, #ff4081, #673ab7)",
                boxShadow: "0 10px 30px rgba(255, 64, 129, 0.3)"
              }}
            >
              <h1 className="display-4 fw-bold mb-2" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
                <i className="bi bi-music-note-beamed me-3"></i>
                {concierto.nombre}
              </h1>
              <p className="lead mb-0">
                <i className="bi bi-calendar3 me-2"></i>
                {new Date(concierto.fecha).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {message.text && (
          <Alert 
            variant={message.type === "success" ? "success" : "danger"}
            className="mt-3"
          >
            {message.text}
          </Alert>
        )}
        
        <Row>
          <Col lg={8}>
            {/* Información del evento mejorada */}
            <Card 
              className="mb-4 shadow-lg"
              style={{ 
                backgroundColor: "#111", 
                color: "#fff", 
                border: "1px solid #333",
                borderRadius: "15px"
              }}
            >
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div 
                      className="p-3 rounded mb-3"
                      style={{ backgroundColor: "#1a1a1a", border: "1px solid #444" }}
                    >
                      <h5 style={{ color: "#00bcd4" }}>
                        <i className="bi bi-info-circle me-2"></i>
                        Información del Evento
                      </h5>
                      <div className="mt-3">
                        <div className="d-flex align-items-center mb-2">
                          <Badge bg="secondary" className="me-2 p-2">
                            <i className="bi bi-tag me-1"></i>
                            {concierto.categoria}
                          </Badge>
                        </div>
                        <p className="mb-2">
                          <strong><i className="bi bi-geo-alt me-2" style={{ color: "#ff4081" }}></i>Ciudad:</strong> 
                          <span className="ms-2">{concierto.ciudad}</span>
                        </p>
                        <p className="mb-2">
                          <strong><i className="bi bi-building me-2" style={{ color: "#ff4081" }}></i>Lugar:</strong> 
                          <span className="ms-2">{concierto.lugar}</span>
                        </p>
                        <p className="mb-2">
                          <strong><i className="bi bi-clock me-2" style={{ color: "#ff4081" }}></i>Hora:</strong> 
                          <span className="ms-2">
                            {new Date(concierto.fecha).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </p>
                        {concierto.descripcion && (
                          <div className="mt-3">
                            <strong><i className="bi bi-card-text me-2" style={{ color: "#ff4081" }}></i>Descripción:</strong>
                            <p className="mt-2 text-muted">{concierto.descripcion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div 
                      className="p-3 rounded"
                      style={{ backgroundColor: "#1a1a1a", border: "1px solid #444" }}
                    >
                      <h5 style={{ color: "#00bcd4" }}>
                        <i className="bi bi-grid-3x3-gap me-2"></i>
                        Zonas Disponibles
                      </h5>
                      <div className="mt-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {zonas.map(zona => (
                          <div 
                            key={zona.id} 
                            className="mb-3 p-3" 
                            style={{ 
                              backgroundColor: "#222", 
                              borderRadius: "10px",
                              border: selectedZona === zona.id ? "2px solid #00bcd4" : "1px solid #444",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              transform: selectedZona === zona.id ? "scale(1.02)" : "scale(1)"
                            }}
                            onClick={() => setSelectedZona(zona.id)}
                            onMouseEnter={(e) => {
                              if (selectedZona !== zona.id) {
                                e.target.style.backgroundColor = "#2a2a2a";
                                e.target.style.transform = "scale(1.01)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedZona !== zona.id) {
                                e.target.style.backgroundColor = "#222";
                                e.target.style.transform = "scale(1)";
                              }
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1 d-flex align-items-center" style={{ color: "#fff" }}>
                                  <i className="bi bi-check-circle me-2" style={{ 
                                    color: selectedZona === zona.id ? "#00bcd4" : "#4caf50" 
                                  }}></i>
                                  {zona.nombre}
                                </h6>
                                <small style={{ color: "#ccc" }}>
                                  <i className="bi bi-people me-1"></i>
                                  Capacidad: {zona.capacidad.toLocaleString()} | 
                                  <i className="bi bi-check-circle ms-2 me-1"></i>
                                  Disponibles: {asientosDisponibles[zona.id]?.toLocaleString() || 0}
                                </small>
                              </div>
                              <div className="text-end">
                                <div style={{ color: "#4caf50", fontWeight: "bold", fontSize: "1.1rem" }}>
                                  {formatPrice(zona.precio)}
                                </div>
                                <Badge bg={getDisponibilidadColor(zona.id)} className="mt-1">
                                  {asientosDisponibles[zona.id] > 0 ? "Disponible" : "Agotado"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Visualización de asientos */}
            {selectedZona && (
              <Card className="mt-4 shadow-lg" style={{ backgroundColor: "#111", color: "#fff", border: "1px solid #333", borderRadius: "15px" }}>
                <Card.Header style={{ backgroundColor: "#222", borderRadius: "15px 15px 0 0" }}>
                  <h5 className="mb-0">
                    <i className="bi bi-grid-3x3-gap me-2"></i>
                    Vista de Asientos - {getSelectedZonaInfo()?.nombre}
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="seat-preview-container" style={{ backgroundColor: "#222", padding: "20px", borderRadius: "8px", minHeight: "500px", overflowX: "auto" }}>
                    <div className="mb-3 pb-2 border-bottom border-secondary d-flex justify-content-between align-items-center">
                      <div>
                        <h5 style={{ color: "#00bcd4" }}>
                          {getSelectedZonaInfo()?.nombre}
                        </h5>
                        <Badge bg="info">
                          Capacidad: {getSelectedZonaInfo()?.capacidad.toLocaleString()} asientos
                        </Badge>
                        <Badge bg={getDisponibilidadColor(selectedZona)} className="ms-2">
                          Disponibles: {asientosDisponibles[selectedZona]?.toLocaleString() || 0}
                        </Badge>
                      </div>
                      <div>
                        <Badge bg="success" className="p-2 me-2" style={{ fontSize: "14px" }}>
                          <i className="bi bi-circle-fill me-1" style={{ color: "#4caf50" }}></i> Disponible
                        </Badge>
                        <Badge bg="secondary" className="p-2" style={{ fontSize: "14px" }}>
                          <i className="bi bi-circle-fill me-1" style={{ color: "#6c757d" }}></i> Ocupado
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="seat-layout" style={{ marginBottom: "20px" }}>
                      {/* Pantalla o escenario */}
                      <div className="screen" style={{ 
                        background: getSelectedZonaInfo() && determineLayoutType(getSelectedZonaInfo().nombre) === "semicircular" 
                          ? "linear-gradient(180deg, #673ab7, #4a148c)" 
                          : "linear-gradient(180deg, #333, #222)", 
                        padding: "12px", 
                        textAlign: "center", 
                        marginBottom: "30px",
                        borderRadius: getSelectedZonaInfo() && determineLayoutType(getSelectedZonaInfo().nombre) === "semicircular" ? "50% 50% 0 0" : "5px",
                        width: getSelectedZonaInfo() && determineLayoutType(getSelectedZonaInfo().nombre) === "semicircular" ? "80%" : "100%",
                        maxWidth: "600px",
                        margin: "0 auto 30px",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "14px",
                        boxShadow: getSelectedZonaInfo() && determineLayoutType(getSelectedZonaInfo().nombre) === "semicircular" 
                          ? "0 -2px 15px rgba(103, 58, 183, 0.5)" 
                          : "0 2px 10px rgba(0,0,0,0.3)",
                        border: getSelectedZonaInfo() && determineLayoutType(getSelectedZonaInfo().nombre) === "semicircular" 
                          ? "1px solid #9c27b0" 
                          : "1px solid #444",
                      }}>
                        <i className={getSelectedZonaInfo() && determineLayoutType(getSelectedZonaInfo().nombre) === "semicircular" 
                          ? "bi bi-music-note-beamed me-2" 
                          : "bi bi-display me-2"}></i>
                        {getSelectedZonaInfo() && determineLayoutType(getSelectedZonaInfo().nombre) === "semicircular" 
                          ? "ESCENARIO" 
                          : "PANTALLA / ESCENARIO"}
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
                        {getSelectedZonaInfo() && (
                          <>
                            {determineLayoutType(getSelectedZonaInfo().nombre) === "recto" ? (
                              // Layout recto
                              <div style={{ 
                                display: "flex", 
                                flexWrap: "wrap", 
                                justifyContent: "center",
                                maxWidth: "95%",
                                margin: "0 auto",
                                padding: "15px",
                                background: "#1a1a1a",
                                borderRadius: "8px",
                                boxShadow: "inset 0 0 15px rgba(0, 188, 212, 0.2)",
                                border: "1px solid #333"
                              }}>
                                {/* Agrupar por filas */}
                                {generatePreviewSeats(getSelectedZonaInfo()).length > 0 && 
                                  Array.from(
                                    new Set(generatePreviewSeats(getSelectedZonaInfo()).map(seat => seat.row))
                                  ).map(row => (
                                  <div key={row} style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: "10px" }}>
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
                                    {generatePreviewSeats(getSelectedZonaInfo())
                                      .filter(seat => seat.row === row)
                                      .map(seat => (
                                        <div
                                          key={seat.id}
                                          style={{
                                            width: "22px",
                                            height: "22px",
                                            margin: "0 2px",
                                            backgroundColor: seat.available ? "#4caf50" : "#6c757d",
                                            borderRadius: "3px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "10px",
                                            fontWeight: "bold",
                                            color: seat.available ? "#fff" : "#ddd",
                                            boxShadow: seat.available 
                                              ? "0 2px 4px rgba(0,255,0,0.2)" 
                                              : "0 1px 3px rgba(0,0,0,0.3)",
                                            border: seat.available 
                                              ? "1px solid #45c65a" 
                                              : "1px solid #555",
                                            transition: "all 0.2s ease",
                                            cursor: seat.available ? "pointer" : "default"
                                          }}
                                          title={`Fila ${seat.row} Asiento ${seat.number}`}
                                        >
                                          {seat.number}
                                        </div>
                                      ))}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              // Layout semicircular
                              <div style={{ 
                                position: "relative", 
                                width: "100%", 
                                height: "500px", // Mayor altura
                                marginTop: "20px",                                                     
                                overflow: "visible", // Visible para mostrar todos los asientos
                                padding: "20px 10px", // Agregar padding
                                minWidth: "600px", // Ancho mínimo para evitar distorsión
                                maxWidth: "800px", // Ancho máximo
                                margin: "0 auto" // Centrar
                              }}>
                                {/* Marcadores de filas */}
                                {Array.from(new Set(generatePreviewSeats(getSelectedZonaInfo()).map(seat => seat.row))).map(row => {
                                  const firstSeatInRow = generatePreviewSeats(getSelectedZonaInfo()).find(seat => seat.row === row);
                                  if (!firstSeatInRow) return null;
                                
                    
                                })}

                                {generatePreviewSeats(getSelectedZonaInfo()).map(seat => (
                                  <div
                                    key={seat.id}
                                    style={{
                                      position: "absolute",
                                      left: `${seat.x * 35}px`, // Mayor separación horizontal
                                      top: `${seat.y * 35}px`, // Mayor separación vertical
                                      width: "26px", // Asientos más grandes
                                      height: "26px",
                                      backgroundColor: seat.available ? "#4caf50" : "#6c757d",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: seat.number < 10 ? "12px" : "10px", // Tamaño adaptativo
                                      fontWeight: "bold",
                                      color: seat.available ? "#fff" : "#ddd",
                                      boxShadow: seat.available ? "0 2px 5px rgba(0,255,0,0.3)" : "0 1px 3px rgba(0,0,0,0.3)",
                                      border: seat.available ? "1px solid #45c65a" : "1px solid #555",
                                      transition: "all 0.2s ease",
                                      cursor: seat.available ? "pointer" : "default",
                                      zIndex: 10 // Mayor z-index para evitar solapamiento
                                    }}
                                    title={`Fila ${seat.row} Asiento ${seat.number}`}
                                  >
                                    {seat.number}
                                  </div>
                                ))}
                                
                          
                                
                                
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      {getSelectedZonaInfo()?.capacidad > 200 && (
                        <div className="text-center text-muted mt-3">
                          <small>Mostrando vista previa de 200 asientos. La zona tendrá {getSelectedZonaInfo().capacidad.toLocaleString()} asientos en total.</small>
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
          
          <Col lg={4}>
            <Card 
              className="shadow-lg"
              style={{ 
                backgroundColor: "#333", 
                color: "#fff", 
                position: "sticky", 
                top: "20px",
                borderRadius: "15px",
                border: "1px solid #444"
              }}
            >
              <Card.Header style={{ backgroundColor: "#444", borderRadius: "15px 15px 0 0" }}>
                <h5 className="mb-0">
                  <i className="bi bi-cart-plus me-2"></i>
                  Seleccionar Tickets
                </h5>
              </Card.Header>
              <Card.Body>
                {zonas.length > 0 ? (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Zona:</Form.Label>
                      <Form.Select 
                        value={selectedZona}
                        onChange={(e) => setSelectedZona(e.target.value)}
                        style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #555", borderRadius: "8px" }}
                      >
                        <option value="">Selecciona una zona</option>
                        {zonas.map(zona => (
                          <option 
                            key={zona.id} 
                            value={zona.id}
                            disabled={!asientosDisponibles[zona.id] || asientosDisponibles[zona.id] === 0}
                          >
                            {zona.nombre} - {formatPrice(zona.precio)} 
                            ({asientosDisponibles[zona.id] || 0} disponibles)
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Subtotal:</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max={selectedZona ? Math.min(10, asientosDisponibles[selectedZona] || 0) : 10}
                        value={cantidad}
                        onChange={(e) => setCantidad(parseInt(e.target.value))}
                        style={{ backgroundColor: "#222", color: "#fff", border: "1px solid #555", borderRadius: "8px" }}
                        disabled={!selectedZona}
                      />
                      {selectedZona && (
                        <Form.Text style={{ color: "#ccc" }}>
                          Máximo {Math.min(10, asientosDisponibles[selectedZona] || 0)} tickets por compra
                        </Form.Text>
                      )}
                    </Form.Group>

                    {selectedZona && (
                      <Card className="mb-3" style={{ backgroundColor: "#222", border: "1px solid #444", borderRadius: "8px" }}>
                        <Card.Body className="py-2">
                          <div className="d-flex justify-content-between">
                            <span style={{ color: "#fff" }}>Subtotal:</span>
                            <strong style={{ color: "#4caf50" }}>
                              {formatPrice((getSelectedZonaInfo()?.precio || 0) * cantidad)}
                            </strong>
                          </div>
                          <div className="d-flex justify-content-between" style={{ color: "#ccc" }}>
                            <small>{cantidad} x {formatPrice(getSelectedZonaInfo()?.precio || 0)}</small>
                          </div>
                        </Card.Body>
                      </Card>
                    )}

                    <Button
                      onClick={handleComprarTicket}
                      className="w-100 mb-2"
                      disabled={!selectedZona || cantidad <= 0 || cantidad > (asientosDisponibles[selectedZona] || 0)}
                      style={{
                        background: "linear-gradient(90deg, #00bcd4, #673ab7)",
                        border: "none",
                        fontSize: "16px",
                        padding: "12px 0",
                        fontWeight: "bold",
                        borderRadius: "8px"
                      }}
                    >
                      {isAuthenticated ? (
                        <>
                          <i className="bi bi-ticket-perforated me-2"></i>
                          COMPRAR TICKETS
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          INICIAR SESIÓN PARA COMPRAR
                        </>
                      )}
                    </Button>

                    {isAuthenticated && (
                      <div className="text-center">
                        <small className="text-muted">
                          <i className="bi bi-shield-check me-1"></i>
                          Compra segura y protegida
                        </small>
                      </div>
                    )}
                  </>
                ) : (
                  <Alert variant="warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    No hay zonas disponibles para este concierto.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="mt-4 text-center">
          <Link to="/conciertos">
            <Button
              size="lg"
              style={{
                background: "linear-gradient(90deg, #ff4081, #673ab7)",
                border: "none",
                borderRadius: "25px",
                padding: "12px 30px"
              }}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver a Conciertos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConciertoDetalle;
