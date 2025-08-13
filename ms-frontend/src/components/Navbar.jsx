import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Navbar.css"; // Importamos el archivo CSS que crearemos

const MenuBar = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  
  // Debug info
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Usuario autenticado:", user);
      console.log("Rol del usuario:", user.rol);
    }
  }, [user, isAuthenticated]);

  // Función para obtener el contador del carrito desde localStorage
  const updateCartCount = () => {
    try {
      const savedCart = localStorage.getItem('encuentro_cart');
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        const totalItems = cartItems.reduce((total, item) => total + item.cantidad, 0);
        setCartCount(totalItems);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      setCartCount(0);
    }
  };

  // Actualizar contador al cargar y cada vez que cambie el localStorage
  useEffect(() => {
    updateCartCount();
    
    // Escuchar cambios en el localStorage
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar eventos personalizados para cambios en la misma pestaña
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    logout();
    // Limpiar carrito al cerrar sesión
    localStorage.removeItem('encuentro_cart');
    setCartCount(0);
  };

  if (loading) {
    return (
      <Navbar expand="lg" className="custom-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand-logo">
            <i className="bi bi-music-note-beamed me-2"></i>
            ENCUENTRO
          </Navbar.Brand>
          <div className="navbar-loader">
            <div className="spinner-grow spinner-grow-sm text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </Navbar>
    );
  }

  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-logo">
          <i className="bi bi-music-note-beamed me-2"></i>
          ENCUENTRO
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggler" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto nav-links">
            <Nav.Link as={Link} to="/" className="nav-link-custom">
              <i className="bi bi-house-door"></i> Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/conciertos" className="nav-link-custom">
              <i className="bi bi-music-note"></i> Conciertos
            </Nav.Link>
            
            {isAuthenticated ? (
              <>
                {/* Mostrar "Administrar Conciertos" solo si el usuario es admin */}
                {user?.rol === "admin" && (
                  <Nav.Link as={Link} to="/admin/conciertos" className="admin-link nav-link-custom">
                    <i className="bi bi-music-note-list"></i> Administrar Conciertos
                  </Nav.Link>
                )}
                <Nav.Link as={Link} to="/cart" className="position-relative nav-link-custom cart-link">
                  <i className="bi bi-cart3"></i> Carrito
                  {cartCount > 0 && (
                    <Badge 
                      pill 
                      className="cart-badge position-absolute top-0 start-100 translate-middle"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Nav.Link>
                <NavDropdown 
                  title={
                    <>
                      <i className="bi bi-person-circle"></i> {` Hola, ${user?.nombres?.split(' ')[0] || 'Usuario'}`}
                      {user?.rol === "admin" && (
                        <Badge 
                          className="admin-badge ms-2"
                        >
                          ADMIN
                        </Badge>
                      )}
                    </>
                  }
                  id="user-dropdown"
                  align="end"
                  className="user-dropdown"
                >
                  <div className="dropdown-header">
                    <div className="user-icon">
                      <i className="bi bi-person-circle"></i>
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user?.nombres || 'Usuario'}</span>
                      <span className="user-email">{user?.email}</span>
                    </div>
                  </div>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/mis-reservas" className="dropdown-item-custom">
                    <i className="bi bi-ticket-perforated"></i> Mis Reservas
                  </NavDropdown.Item>
               
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="dropdown-item-custom logout-item">
                    <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link-custom auth-link">
                  <i className="bi bi-box-arrow-in-right"></i> Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="nav-link-custom register-link">
                  <i className="bi bi-person-plus"></i> Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MenuBar;
