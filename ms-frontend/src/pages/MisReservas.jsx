import React, { useState, useEffect, useCallback } from "react";
import { Container, Card, Button, Row, Col, Alert, Spinner, Badge, Modal, Tabs, Tab, ProgressBar } from "react-bootstrap";
import { reservaService, entradaService, conciertoService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import QRCode from "react-qr-code"; // Asegúrate de instalar: npm install react-qr-code

// Componente para contar el tiempo restante
const CountdownTimer = ({ vencimiento, onExpire }) => {
  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const endTime = new Date(vencimiento).getTime();
    const timeLeft = Math.max(0, endTime - now);
    
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    const percentage = Math.max(0, Math.min(100, (timeLeft / (60 * 1000)) * 100));
    
    return {
      minutes,
      seconds,
      percentage,
      expired: timeLeft <= 0
    };
  }, [vencimiento]);
  
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
  useEffect(() => {
    if (timeLeft.expired) {
      if (onExpire) onExpire();
      return;
    }
    
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.expired) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft.expired, calculateTimeLeft, onExpire]);
  
  // Determinar el color de la barra de progreso según el tiempo restante
  const getProgressVariant = () => {
    if (timeLeft.percentage > 66) return "success";
    if (timeLeft.percentage > 33) return "warning";
    return "danger";
  };
  
  return (
    <div className="countdown-container">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span style={{ fontWeight: "bold", color: timeLeft.percentage <= 33 ? "#dc3545" : "#fff" }}>
          <i className="bi bi-clock-history me-1"></i>
          {String(timeLeft.minutes).padStart(1, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <small className="text-muted">
          {timeLeft.expired ? "Expirada" : "Tiempo restante"}
        </small>
      </div>
      <ProgressBar 
        now={timeLeft.percentage} 
        variant={getProgressVariant()} 
        style={{ height: "4px" }}
      />
    </div>
  );
};

const MisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showEntradaModal, setShowEntradaModal] = useState(false);
  const [selectedEntrada, setSelectedEntrada] = useState(null);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [eventosData, setEventosData] = useState({});
  const [zonasData, setZonasData] = useState({});
  const [activeTab, setActiveTab] = useState("entradas");
  
  const { isAuthenticated, user } = useAuth();

  // Define loadUserData with useCallback
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Cargando datos del usuario:", user);
      
      if (!user || !user.id) {
        console.error("No hay usuario autenticado con ID");
        setLoading(false);
        return;
      }
      
      // Cargar entradas del usuario usando su ID
      const entradasData = await entradaService.getEntradasByUsuario(user.id);
      console.log("📥 Entradas cargadas:", entradasData);
      setEntradas(entradasData || []);
      
      // Intentar cargar reservas pendientes del usuario
      let currentReservas = [];
      try {
        const reservasData = await reservaService.getMisReservas();
        console.log("📥 Reservas cargadas:", reservasData);
        
        if (Array.isArray(reservasData)) {
          setReservas(reservasData);
          currentReservas = reservasData;
        } else if (typeof reservasData === 'object' && reservasData !== null) {
          // Si la respuesta es un objeto único, convertirlo a array
          setReservas([reservasData]);
          currentReservas = [reservasData];
          console.log("⚠️ Convertido objeto de reserva a array:", [reservasData]);
        } else {
          setReservas([]);
          currentReservas = [];
        }
      } catch (reservasError) {
        console.log("⚠️ No se pudieron cargar reservas pendientes:", reservasError.message);
        setReservas([]);
        currentReservas = [];
      }
      
      // Recopilar todos los IDs de eventos (tanto de entradas como de reservas)
      const eventosIds = new Set([
        ...(entradasData || []).map(e => e.evento_id),
        ...(currentReservas || []).map(r => r.evento_id)
      ]);
      
      // Recopilar todos los IDs de zonas
      const zonasIds = new Set([
        ...(entradasData || []).map(e => e.zona_id),
        ...(currentReservas || []).map(r => r.zona_id)
      ]);
      
      // Cargar detalles de cada concierto y sus zonas
      const eventos = {};
      const zonas = {};
      
      // Cargar eventos por sus IDs
      for (const eventoId of eventosIds) {
        if (!eventoId) continue;
        try {
          const concierto = await conciertoService.getConciertoById(eventoId);
          eventos[eventoId] = concierto;
          
          // Cargar zonas de este concierto
          const zonasConcierto = await conciertoService.getZonasByConcierto(eventoId);
          zonasConcierto.forEach(zona => {
            zonas[zona.id] = zona;
          });
        } catch (err) {
          console.error(`Error cargando datos del concierto ${eventoId}:`, err);
        }
      }
      
      // Cargar zonas adicionales que no se hayan cargado
      for (const zonaId of zonasIds) {
        if (!zonaId || zonas[zonaId]) continue;
        try {
          const zona = await conciertoService.getZonaById(zonaId);
          zonas[zonaId] = zona;
        } catch (err) {
          console.error(`Error cargando datos de la zona ${zonaId}:`, err);
        }
      }
      
      setEventosData(eventos);
      setZonasData(zonas);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage({ 
        type: "error", 
        text: "Error al cargar tus entradas. Verifica tu conexión." 
      });
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Initial load effect
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user, loadUserData]);

  // Separate effect for auto-refresh to avoid infinite loops
  useEffect(() => {
    let refreshInterval = null;
    
    // Only set up auto-refresh if there are temporal reservations
    const hasTemporal = reservas.some(r => r.estado === 'temporal');
    if (hasTemporal && isAuthenticated && user) {
      console.log("Setting up auto-refresh for temporal reservations");
      refreshInterval = setInterval(() => {
        console.log("Auto-refreshing data due to temporal reservations");
        loadUserData();
      }, 15000); // refresh every 15 seconds
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservas.length]); // Only depend on the number of reservas to avoid infinite loops

  const handleConfirmarReserva = async (reservaId, metodo = "tarjeta") => {
    try {
      setMessage({ type: "info", text: "Confirmando reserva..." });
      console.log(`Enviando confirmación para reserva ${reservaId} con método de pago: ${metodo}`);
      
      // Intentar confirmar la reserva con el API
      await reservaService.confirmarReserva(reservaId, metodo);
      
      setMessage({ 
        type: "success", 
        text: "¡Reserva confirmada! Se está generando tu entrada automáticamente." 
      });
      
      // Cerrar modal
      setShowConfirmPaymentModal(false);
      setSelectedReserva(null);
      
      // Recargar datos inmediatamente para reflejar el estado actualizado
      await loadUserData();
      
      // También recargar después de un tiempo para capturar la entrada generada
      setTimeout(async () => {
        await loadUserData();
        
        // Cambia a la pestaña de entradas si se generó exitosamente
        if (entradas.length > 0) {
          setActiveTab("entradas");
        }
      }, 3000);
      
      // Crear un refresco adicional después de un tiempo más largo
      // para asegurar que la entrada se ha generado
      setTimeout(() => {
        loadUserData();
        // Cambiar a la pestaña de entradas
        setActiveTab("entradas");
      }, 5000);
      
    } catch (error) {
      console.error('Error confirming reserva:', error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Error al confirmar la reserva. Intenta de nuevo." 
      });
    }
  };

  const handleShowConfirmModal = (reserva) => {
    setSelectedReserva(reserva);
    setMetodoPago("tarjeta");
    setShowConfirmPaymentModal(true);
  };

  const handleEliminarReserva = async (reservaId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta reserva?")) {
      return;
    }
    
    try {
      setMessage({ type: "info", text: "Eliminando reserva..." });
      console.log(`Eliminando reserva ${reservaId}`);
      
      await reservaService.deleteReserva(reservaId);
      
      // Eliminar la reserva del estado local antes de recargar datos completos
      setReservas(prev => prev.filter(r => r.id !== reservaId));
      
      setMessage({ 
        type: "success", 
        text: "Reserva eliminada exitosamente." 
      });
      
      // Recargar datos después de eliminar para asegurar estado actual
      setTimeout(() => {
        loadUserData();
      }, 500);
      
    } catch (error) {
      console.error('Error deleting reserva:', error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Error al eliminar la reserva. Intenta de nuevo." 
      });
      
      // Recargar datos igualmente para asegurar consistencia
      loadUserData();
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Debes <a href="/login">iniciar sesión</a> para ver tus reservas.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando tus reservas...</p>
      </Container>
    );
  }

  // Formato fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Formato de precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  // Modal para confirmar pago
  const ConfirmPaymentModal = () => {
    if (!selectedReserva) return null;
    
    const evento = eventosData[selectedReserva.evento_id] || {};
    const zona = zonasData[selectedReserva.zona_id] || {};
    const total = (zona.precio || 0) * selectedReserva.cantidad;
    
    return (
      <Modal 
        show={showConfirmPaymentModal} 
        onHide={() => setShowConfirmPaymentModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ backgroundColor: "#222", color: "#fff", border: "none" }}>
          <Modal.Title>
            <i className="bi bi-credit-card me-2"></i>
            Confirmar Pago
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#111", color: "#fff" }}>
          <div className="mb-3">
            <h5 style={{ color: "#00bcd4" }}>Resumen de la reserva</h5>
            <p className="mb-1"><strong>Evento:</strong> {evento.nombre}</p>
            <p className="mb-1"><strong>Zona:</strong> {zona.nombre}</p>
            <p className="mb-1"><strong>Cantidad:</strong> {selectedReserva.cantidad} tickets</p>
            <p className="mb-1"><strong>Precio unitario:</strong> ${zona.precio}</p>
            <div className="p-2 bg-dark rounded mt-2">
              <h6 className="mb-0" style={{ color: "#4caf50" }}>
                <strong>Total a pagar: ${total.toFixed(2)}</strong>
              </h6>
            </div>
          </div>
          
          <div className="mb-4">
            <h5 style={{ color: "#00bcd4" }}><i className="bi bi-credit-card me-2"></i>Selecciona un método de pago:</h5>
            <div className="payment-methods mt-3">
              <div className="row g-3">
                <div className="col-6">
                  <div 
                    className={`payment-method-card p-3 text-center ${metodoPago === "tarjeta" ? "selected" : ""}`}
                    onClick={() => setMetodoPago("tarjeta")}
                    style={{
                      backgroundColor: metodoPago === "tarjeta" ? "#1e3a8a" : "#222",
                      border: metodoPago === "tarjeta" ? "2px solid #3b82f6" : "1px solid #555",
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div className="icon mb-2" style={{ fontSize: "28px" }}>💳</div>
                    <div className="name" style={{ fontWeight: "bold" }}>Tarjeta</div>
                    <div className="type" style={{ fontSize: "12px", color: "#aaa" }}>Crédito/Débito</div>
                    {metodoPago === "tarjeta" && (
                      <div className="check mt-2">
                        <i className="bi bi-check-circle-fill" style={{ color: "#3b82f6" }}></i>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div 
                    className={`payment-method-card p-3 text-center ${metodoPago === "efectivo" ? "selected" : ""}`}
                    onClick={() => setMetodoPago("efectivo")}
                    style={{
                      backgroundColor: metodoPago === "efectivo" ? "#1e3a8a" : "#222",
                      border: metodoPago === "efectivo" ? "2px solid #3b82f6" : "1px solid #555",
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div className="icon mb-2" style={{ fontSize: "28px" }}>💵</div>
                    <div className="name" style={{ fontWeight: "bold" }}>Efectivo</div>
                    <div className="type" style={{ fontSize: "12px", color: "#aaa" }}>Pago en taquilla</div>
                    {metodoPago === "efectivo" && (
                      <div className="check mt-2">
                        <i className="bi bi-check-circle-fill" style={{ color: "#3b82f6" }}></i>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div 
                    className={`payment-method-card p-3 text-center ${metodoPago === "transferencia" ? "selected" : ""}`}
                    onClick={() => setMetodoPago("transferencia")}
                    style={{
                      backgroundColor: metodoPago === "transferencia" ? "#1e3a8a" : "#222",
                      border: metodoPago === "transferencia" ? "2px solid #3b82f6" : "1px solid #555",
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div className="icon mb-2" style={{ fontSize: "28px" }}>🏦</div>
                    <div className="name" style={{ fontWeight: "bold" }}>Transferencia</div>
                    <div className="type" style={{ fontSize: "12px", color: "#aaa" }}>Bancaria</div>
                    {metodoPago === "transferencia" && (
                      <div className="check mt-2">
                        <i className="bi bi-check-circle-fill" style={{ color: "#3b82f6" }}></i>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div 
                    className={`payment-method-card p-3 text-center ${metodoPago === "paypal" ? "selected" : ""}`}
                    onClick={() => setMetodoPago("paypal")}
                    style={{
                      backgroundColor: metodoPago === "paypal" ? "#1e3a8a" : "#222",
                      border: metodoPago === "paypal" ? "2px solid #3b82f6" : "1px solid #555",
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div className="icon mb-2" style={{ fontSize: "28px" }}>💙</div>
                    <div className="name" style={{ fontWeight: "bold" }}>PayPal</div>
                    <div className="type" style={{ fontSize: "12px", color: "#aaa" }}>Pago online</div>
                    {metodoPago === "paypal" && (
                      <div className="check mt-2">
                        <i className="bi bi-check-circle-fill" style={{ color: "#3b82f6" }}></i>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            Al confirmar, se procesará el pago y se generará automáticamente tu entrada con código QR.
          </Alert>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#222", border: "none" }}>
          <Button 
            variant="outline-light" 
            onClick={() => setShowConfirmPaymentModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            style={{
              background: "linear-gradient(90deg, #4caf50, #2e7d32)",
              border: "none"
            }} 
            onClick={() => handleConfirmarReserva(selectedReserva.id, metodoPago)}
          >
            <i className="bi bi-check-circle me-2"></i>
            Confirmar Pago (${total.toFixed(2)})
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  
  // Modal para mostrar detalles de una entrada
  const EntradaModal = () => {
    if (!selectedEntrada) return null;
    
    const evento = eventosData[selectedEntrada.evento_id] || {};
    const zona = zonasData[selectedEntrada.zona_id] || {};
    const qrValue = selectedEntrada.id || "entrada-no-id";
    
    return (
      <Modal 
        show={showEntradaModal} 
        onHide={() => setShowEntradaModal(false)}
        size="lg"
        centered
        className="entrada-modal"
      >
        <Modal.Header closeButton style={{ backgroundColor: "#222", color: "#fff", border: "none" }}>
          <Modal.Title>
            <i className="bi bi-ticket-perforated me-2"></i>
            Entrada Digital
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#111", color: "#fff", padding: "0" }}>
          <div className="ticket-container" style={{
            background: "linear-gradient(135deg, #1a1a1a, #2b0052)",
            borderRadius: "10px",
            overflow: "hidden",
            position: "relative"
          }}>
            <div className="ticket-header p-4" style={{
              background: "linear-gradient(90deg, #00bcd4, #673ab7)",
              borderRadius: "10px 10px 0 0"
            }}>
              <h3 className="mb-1">{evento.nombre || "Evento"}</h3>
              <div className="d-flex justify-content-between">
                <span>
                  <i className="bi bi-calendar-event me-1"></i>
                  {formatDate(evento.fecha || selectedEntrada.fecha)}
                </span>
                <span>
                  <i className="bi bi-geo-alt me-1"></i>
                  {evento.lugar || ""}
                </span>
              </div>
            </div>
            
            <div className="ticket-content d-flex p-4">
              <div className="ticket-details flex-grow-1 pe-3">
                <div className="mb-4">
                  <h5 style={{ color: "#00bcd4" }}>Detalles del evento</h5>
                  <p className="mb-1">
                    <strong>Zona:</strong> {zona.nombre || "Zona no especificada"}
                  </p>
                  <p className="mb-1">
                    <strong>Cantidad:</strong> {selectedEntrada.cantidad} {selectedEntrada.cantidad === 1 ? "ticket" : "tickets"}
                  </p>
                  <p className="mb-1">
                    <strong>Precio:</strong> {formatPrice(zona.precio || 0)} c/u
                  </p>
                  <p className="mb-1">
                    <strong>Total:</strong> {formatPrice((zona.precio || 0) * selectedEntrada.cantidad)}
                  </p>
                </div>
                
                <div>
                  <h5 style={{ color: "#00bcd4" }}>Información de la entrada</h5>
                  <p className="mb-1">
                    <strong>ID Entrada:</strong> {selectedEntrada.id}
                  </p>
                  <p className="mb-1">
                    <strong>Fecha de compra:</strong> {formatDate(selectedEntrada.fecha)}
                  </p>
                  <p className="mb-0">
                    <strong>Estado:</strong> <Badge bg="success">CONFIRMADA</Badge>
                  </p>
                </div>
              </div>
              
              <div className="ticket-qr" style={{
                backgroundColor: "white",
                padding: "15px",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <QRCode value={qrValue} size={150} />
                <div className="mt-2 text-center" style={{ color: "black", fontSize: "12px" }}>
                  <strong>ID: {selectedEntrada.id.substring(0, 8)}</strong>
                </div>
              </div>
            </div>
            
            <div className="ticket-footer p-3 text-center" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
              <small>Presenta este código QR en la entrada del evento</small>
              <div className="mt-1">
                <small className="text-muted">Powered by Encuentro MS</small>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#222", border: "none" }}>
          <Button variant="outline-light" onClick={() => setShowEntradaModal(false)}>
            Cerrar
          </Button>
          <Button 
            style={{
              background: "linear-gradient(90deg, #00bcd4, #673ab7)",
              border: "none"
            }}
          >
            <i className="bi bi-printer me-2"></i>
            Imprimir Entrada
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <Container className="py-4">
      <h3 style={{ color: "#ff4081" }}>
        <i className="bi bi-ticket-perforated me-2"></i>
        Mis Reservas y Entradas
      </h3>
      
      {message.text && (
        <Alert 
          variant={message.type === "success" ? "success" : "danger"}
          onClose={() => setMessage({ type: "", text: "" })}
          dismissible
        >
          {message.text}
        </Alert>
      )}

      {/* Tabs para navegar entre reservas y entradas */}
      <Tabs
        activeKey={activeTab}
        onSelect={k => setActiveTab(k)}
        className="mb-4 mt-4 custom-tabs"
        fill
      >
        <Tab 
          eventKey="entradas" 
          title={
            <span>
              <i className="bi bi-ticket-perforated me-2"></i>
              Entradas Confirmadas {entradas.length > 0 && <Badge bg="success">{entradas.length}</Badge>}
            </span>
          }
        >
          {/* Contenido de la tab de Entradas Confirmadas */}
          <div className="mt-4">
            {entradas.length === 0 ? (
              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                No tienes entradas confirmadas aún. Crea reservas y confírmalas para generar tus entradas.
              </Alert>
            ) : (
              <Row>
                {entradas.map((entrada) => {
                  const evento = eventosData[entrada.evento_id] || {};
                  const zona = zonasData[entrada.zona_id] || {};
                  
                  return (
                    <Col key={entrada.id} md={6} className="mb-3">
                      <Card 
                        style={{
                          backgroundColor: "#111",
                          color: "#fff",
                          borderRadius: "10px",
                          border: "2px solid #4caf50",
                          cursor: "pointer",
                          transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                        className="ticket-card"
                        onClick={() => {
                          setSelectedEntrada(entrada);
                          setShowEntradaModal(true);
                        }}
                      >
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Badge bg="success" pill>CONFIRMADA</Badge>
                            <Badge bg="primary" pill>Ver Detalles →</Badge>
                          </div>
                          
                          <h5 style={{ color: "#00bcd4" }}>
                            {evento.nombre || "Cargando evento..."}
                          </h5>
                          
                          <p className="mb-1">
                            <i className="bi bi-calendar-event me-2"></i>
                            {evento.fecha ? formatDate(evento.fecha) : "Fecha pendiente"}
                          </p>
                          
                          <p className="mb-1">
                            <i className="bi bi-geo-alt me-2"></i>
                            {evento.lugar || "Lugar por confirmar"}
                          </p>
                          
                          <p className="mb-1">
                            <i className="bi bi-grid me-2"></i>
                            <strong>Zona:</strong> {zona.nombre || "Cargando zona..."}
                          </p>
                          
                          <p className="mb-1">
                            <i className="bi bi-ticket-perforated me-2"></i>
                            <strong>Cantidad:</strong> {entrada.cantidad} {entrada.cantidad === 1 ? 'ticket' : 'tickets'}
                          </p>
                          
                          <div className="text-end mt-3">
                            <Button 
                              variant="outline-light" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevenir que se abra el modal al hacer click en este botón
                                setSelectedEntrada(entrada);
                                setShowEntradaModal(true);
                              }}
                            >
                              <i className="bi bi-qr-code me-2"></i>
                              Ver Entrada
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </div>
        </Tab>
        
        <Tab 
          eventKey="reservas" 
          title={
            <span>
              <i className="bi bi-calendar-plus me-2"></i>
              Reservas Pendientes {reservas.filter(r => r.estado === "temporal").length > 0 && (
                <Badge bg="warning">{reservas.filter(r => r.estado === "temporal").length}</Badge>
              )}
            </span>
          }
        >
          {/* Contenido de la tab de Reservas Pendientes */}
          <div className="mt-4">
            {reservas.length === 0 ? (
              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                No tienes reservas pendientes de confirmación.
              </Alert>
            ) : reservas.filter(r => r.estado === "temporal").length === 0 ? (
              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                No tienes reservas temporales pendientes de confirmación.
              </Alert>
            ) : (
              <Row>
                {reservas.filter(r => r.estado === "temporal").map((reserva) => {
                  const evento = eventosData[reserva.evento_id] || {};
                  const zona = zonasData[reserva.zona_id] || {};
                  
                  // Función para manejar la expiración de la reserva
                  const handleExpiredReservation = () => {
                    console.log(`Reserva ${reserva.id} ha expirado. Recargando datos...`);
                    loadUserData();
                  };
                  
                  // Determinar si la reserva está expirada
                  const vencimiento = new Date(reserva.vencimiento || "");
                  const ahora = new Date();
                  const expirada = ahora > vencimiento;
                  
                  return (
                    <Col key={reserva.id} md={6} className="mb-3">
                      <Card 
                        style={{
                          backgroundColor: "#111",
                          color: "#fff",
                          borderRadius: "10px",
                          border: expirada ? "2px solid #dc3545" : "2px solid #ffc107",
                          boxShadow: expirada ? "0 0 15px rgba(220, 53, 69, 0.3)" : "0 0 15px rgba(255, 193, 7, 0.3)"
                        }}
                      >
                        <Card.Header style={{ 
                          backgroundColor: "#222", 
                          borderBottom: "1px solid #444",
                          borderRadius: "10px 10px 0 0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <h5 className="mb-0" style={{ color: "#ffc107" }}>
                            <i className="bi bi-hourglass-split me-2"></i>
                            Reserva Temporal
                          </h5>
                          <Badge 
                            bg={expirada ? "danger" : "warning"} 
                            pill
                            style={{ padding: "8px 12px" }}
                          >
                            {expirada ? "EXPIRADA" : "PENDIENTE"}
                          </Badge>
                        </Card.Header>
                        <Card.Body>
                          {/* Contador de tiempo destacado para reservas temporales */}
                          {!expirada && (
                            <div className="mb-3" style={{ 
                              background: "linear-gradient(90deg, #222, #2c2c2c)", 
                              padding: "15px", 
                              borderRadius: "8px",
                              border: "1px solid #ffc107"
                            }}>
                              <div className="text-center mb-2">
                                <span style={{ color: "#ffc107", fontWeight: "bold" }}>
                                  <i className="bi bi-clock-history me-2"></i>
                                  Tiempo para confirmar:
                                </span>
                              </div>
                              <CountdownTimer 
                                vencimiento={vencimiento} 
                                onExpire={handleExpiredReservation} 
                              />
                            </div>
                          )}
                          
                          {expirada && (
                            <Alert variant="danger" className="mb-3">
                              <i className="bi bi-exclamation-triangle-fill me-2"></i>
                              Esta reserva ha expirado. Ya no puede ser confirmada.
                            </Alert>
                          )}
                          
                          <h5 style={{ color: "#00bcd4" }}>
                            {evento.nombre || "Cargando evento..."}
                          </h5>
                          
                          <p className="mb-1">
                            <i className="bi bi-calendar-event me-2"></i>
                            {evento.fecha ? formatDate(evento.fecha) : "Fecha pendiente"}
                          </p>
                          
                          <p className="mb-1">
                            <i className="bi bi-geo-alt me-2"></i>
                            {evento.lugar || "Lugar por confirmar"}
                          </p>
                          
                          <p className="mb-1">
                            <i className="bi bi-grid me-2"></i>
                            <strong>Zona:</strong> {zona.nombre || "Cargando zona..."}
                          </p>
                          
                          <p className="mb-1">
                            <i className="bi bi-ticket-perforated me-2"></i>
                            <strong>Cantidad:</strong> {reserva.cantidad} {reserva.cantidad === 1 ? 'ticket' : 'tickets'}
                          </p>
                          
                          {zona.precio && (
                            <p className="mb-1">
                              <i className="bi bi-currency-dollar me-2"></i>
                              <strong>Total:</strong> {formatPrice(zona.precio * reserva.cantidad)}
                            </p>
                          )}

                          <p className="mb-1">
                            <i className="bi bi-upc-scan me-2"></i>
                            <strong>ID Reserva:</strong> <span style={{ fontSize: "0.9em", color: "#aaa" }}>{reserva.id}</span>
                          </p>
                          
                          <div className="mt-4 d-flex flex-column">
                            {!expirada && (
                              <Button 
                                variant="success"
                                size="lg"
                                className="mb-2"
                                style={{ 
                                  background: "linear-gradient(90deg, #4caf50, #2e7d32)", 
                                  border: "none",
                                  fontWeight: "bold"
                                }}
                                onClick={() => handleShowConfirmModal(reserva)}
                              >
                                <i className="bi bi-check-circle me-2"></i>
                                CONFIRMAR RESERVA
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline-danger"
                              size={expirada ? "lg" : "md"}
                              className={expirada ? "" : "mt-2"}
                              onClick={() => handleEliminarReserva(reserva.id)}
                            >
                              <i className="bi bi-trash me-1"></i>
                              {expirada ? "ELIMINAR RESERVA EXPIRADA" : "Cancelar reserva"}
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
            
            {/* Reservas confirmadas que no han generado entradas aún */}
            {reservas.filter(r => r.estado === "confirmada").length > 0 && (
              <div className="mt-4">
                <h5 className="mb-3" style={{ color: "#4caf50" }}>
                  <i className="bi bi-check-circle me-2"></i>
                  Reservas Confirmadas
                </h5>
                
                <Row>
                  {reservas.filter(r => r.estado === "confirmada").map((reserva) => {
                    const evento = eventosData[reserva.evento_id] || {};
                    const zona = zonasData[reserva.zona_id] || {};
                    
                    return (
                      <Col key={reserva.id} md={6} className="mb-3">
                        <Card 
                          style={{
                            backgroundColor: "#111",
                            color: "#fff",
                            borderRadius: "10px",
                            border: "2px solid #4caf50",
                            boxShadow: "0 0 15px rgba(76, 175, 80, 0.3)"
                          }}
                        >
                          <Card.Header style={{ 
                            backgroundColor: "#222", 
                            borderBottom: "1px solid #444",
                            borderRadius: "10px 10px 0 0",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                            <h5 className="mb-0" style={{ color: "#4caf50" }}>
                              <i className="bi bi-check-circle me-2"></i>
                              Reserva Confirmada
                            </h5>
                            <Badge 
                              bg="success"
                              pill
                              style={{ padding: "8px 12px" }}
                            >
                              CONFIRMADA
                            </Badge>
                          </Card.Header>
                          
                          <Card.Body>
                            <Alert variant="success" className="mb-3">
                              <i className="bi bi-info-circle me-2"></i>
                              Tu entrada se está generando automáticamente. Estará disponible en breve.
                            </Alert>
                            
                            <h5 style={{ color: "#00bcd4" }}>
                              {evento.nombre || "Cargando evento..."}
                            </h5>
                            
                            <p className="mb-1">
                              <i className="bi bi-calendar-event me-2"></i>
                              {evento.fecha ? formatDate(evento.fecha) : "Fecha pendiente"}
                            </p>
                            
                            <p className="mb-1">
                              <i className="bi bi-geo-alt me-2"></i>
                              {evento.lugar || "Lugar por confirmar"}
                            </p>
                            
                            <p className="mb-1">
                              <i className="bi bi-grid me-2"></i>
                              <strong>Zona:</strong> {zona.nombre || "Cargando zona..."}
                            </p>
                            
                            <p className="mb-1">
                              <i className="bi bi-ticket-perforated me-2"></i>
                              <strong>Cantidad:</strong> {reserva.cantidad} {reserva.cantidad === 1 ? 'ticket' : 'tickets'}
                            </p>
                            
                            {zona.precio && (
                              <p className="mb-1">
                                <i className="bi bi-currency-dollar me-2"></i>
                                <strong>Total:</strong> {formatPrice(zona.precio * reserva.cantidad)}
                              </p>
                            )}

                            <p className="mb-1">
                              <i className="bi bi-upc-scan me-2"></i>
                              <strong>ID Reserva:</strong> <span style={{ fontSize: "0.9em", color: "#aaa" }}>{reserva.id}</span>
                            </p>
                            
                            <div className="mt-4 d-flex justify-content-center">
                              <Button 
                                variant="primary"
                                style={{ 
                                  background: "linear-gradient(90deg, #00bcd4, #0097a7)", 
                                  border: "none",
                                  fontWeight: "bold"
                                }}
                                onClick={() => {
                                  setActiveTab("entradas");
                                  setTimeout(() => loadUserData(), 500);
                                }}
                              >
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                VER MIS ENTRADAS
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            )}
          </div>
        </Tab>
      </Tabs>
      
      {/* Modal para mostrar detalles de entrada */}
      <EntradaModal />
      
      {/* Modal para confirmar pago */}
      <ConfirmPaymentModal />

      {/* Información sobre el flujo */}
      <Card style={{ backgroundColor: "#222", color: "#fff" }} className="mt-4">
        <Card.Body>
          <h5><i className="bi bi-lightbulb me-2" style={{ color: "#ffc107" }}></i>¿Cómo funciona?</h5>
          <ol>
            <li>Al comprar tickets desde la página de conciertos, se crea automáticamente una <strong style={{ color: "#ffc107" }}>reserva temporal</strong></li>
            <li>Las reservas temporales tienen <strong style={{ color: "#ffc107" }}>1 minuto</strong> para ser confirmadas antes de expirar</li>
            <li>Para confirmar la reserva, selecciona un <strong style={{ color: "#ffc107" }}>método de pago</strong> y haz clic en "Confirmar"</li>
            <li>Una vez confirmada, se genera automáticamente tu entrada con <strong style={{ color: "#ffc107" }}>código QR</strong></li>
            <li>Puedes ver todas tus entradas confirmadas en la pestaña "Entradas Confirmadas"</li>
          </ol>
          <div className="alert alert-warning p-2 mt-2">
            <small><i className="bi bi-exclamation-triangle me-1"></i> <strong>Importante:</strong> Si no confirmas tu reserva dentro del minuto, esta será eliminada automáticamente.</small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};
     
export default MisReservas;
