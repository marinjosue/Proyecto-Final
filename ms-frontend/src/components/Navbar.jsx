import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "bootstrap-icons/font/bootstrap-icons.css";

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
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">ENCUENTRO</Navbar.Brand>
        </Container>
      </Navbar>
    );
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">ENCUENTRO</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">
              <i className="bi bi-house-door"></i> Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/conciertos">
              <i className="bi bi-music-note"></i> Conciertos
            </Nav.Link>
            
            {isAuthenticated ? (
              <>
                {/* Mostrar "Administrar Conciertos" solo si el usuario es admin */}
                {user?.rol === "admin" && (
                  <Nav.Link as={Link} to="/admin/conciertos" className="admin-link">
                    <i className="bi bi-music-note-list"></i> Administrar Conciertos
                  </Nav.Link>
                )}
                <Nav.Link as={Link} to="/cart" className="position-relative">
                  <i className="bi bi-cart3"></i> Carrito
                  {cartCount > 0 && (
                    <Badge 
                      bg="danger" 
                      pill 
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.7em' }}
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Nav.Link>
                <NavDropdown 
                  title={
                    <>
                      <i className="bi bi-person-circle"></i> {` Hola, ${user?.nombres || 'Usuario'}`}
                      {user?.rol === "admin" && (
                        <Badge 
                          bg="warning" 
                          text="dark" 
                          className="ms-2"
                          style={{ fontSize: '0.7em' }}
                        >
                          ADMIN
                        </Badge>
                      )}
                    </>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/mis-reservas">
                    <i className="bi bi-ticket-perforated"></i> Mis Reservas
                  </NavDropdown.Item>
               
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <i className="bi bi-box-arrow-in-right"></i> Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
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
