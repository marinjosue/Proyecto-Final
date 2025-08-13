import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert, InputGroup, Button } from "react-bootstrap";
import "animate.css";

const Login = () => {
  const [formData, setFormData] = useState({
    correo: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have a redirect URL from state (coming from ticket purchase)
  useEffect(() => {
    if (location.state?.message) {
      setMessage({ type: "info", text: location.state.message });
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!formData.correo || !formData.password) {
      setMessage({ type: "error", text: "Por favor completa todos los campos" });
      return;
    }

    setLoading(true);

    try {
      const result = await login({
        correo: formData.correo,
        password: formData.password,
      });
      
      if (result.success) {
        setMessage({ type: "success", text: "Inicio de sesión exitoso" });
        
        // Check for pending purchase
        const pendingPurchase = localStorage.getItem('pending_purchase');
        
        // Determine where to redirect after login
        setTimeout(() => {
          if (location.state?.redirectUrl) {
            // Redirect to the URL that triggered the login
            navigate(location.state.redirectUrl);
          } else if (pendingPurchase) {
            // Redirect back to the concert page if there was a pending purchase
            const purchase = JSON.parse(pendingPurchase);
            navigate(`/conciertos/${purchase.conciertoId}`);
          } else {
            // Default redirect to home
            navigate('/');
          }
        }, 1000);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: "error", text: "Error al iniciar sesión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "80vh",
        background: "linear-gradient(135deg, #1a1a1a, #2b0052)",
        padding: "20px",
      }}
    >
      <div
        className="card shadow-lg p-4 animate__animated animate__fadeIn"
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#111",
          borderRadius: "15px",
          color: "#fff",
          border: "1px solid #333"
        }}
      >
        <div className="text-center mb-4">
          <i className="bi bi-person-circle" style={{ fontSize: "3rem", color: "#ff4081" }}></i>
          <h3 className="mt-2" style={{ color: "#ff4081" }}>
            Iniciar Sesión
          </h3>
          <p style={{ color: "#fff" }}>Accede a tu cuenta para comprar tickets</p>
        </div>

        {message.text && (
          <Alert 
            variant={message.type === "success" ? "success" : message.type === "info" ? "info" : "danger"}
            className="mb-3"
          >
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#fff" }}>
              <i className="bi bi-envelope me-2"></i>
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="form-control"
              placeholder="ejemplo@correo.com"
              style={{
                backgroundColor: "#222",
                border: "1px solid #444",
                color: "#fff",
                borderRadius: "8px",
                padding: "12px"
              }}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: "#fff" }}>
              <i className="bi bi-lock me-2"></i>
              Contraseña
            </label>
            <InputGroup>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Ingresa tu contraseña"
                style={{
                  backgroundColor: "#222",
                  border: "1px solid #444",
                  color: "#fff",
                  borderRadius: "8px 0 0 8px",
                  padding: "12px"
                }}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={togglePasswordVisibility}
                style={{
                  backgroundColor: "#333",
                  border: "1px solid #444",
                  borderLeft: "none",
                  color: "#fff",
                  borderRadius: "0 8px 8px 0"
                }}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </Button>
            </InputGroup>
          </div>

          <button
            type="submit"
            className="btn w-100 mt-3"
            disabled={loading}
            style={{
              background: "linear-gradient(90deg, #ff4081, #f50057)",
              border: "none",
              color: "#fff",
              fontWeight: "bold",
              transition: "0.3s",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "16px"
            }}
            onMouseOver={(e) =>
              (e.target.style.background = "linear-gradient(90deg, #f50057, #ff4081)")
            }
            onMouseOut={(e) =>
              (e.target.style.background = "linear-gradient(90deg, #ff4081, #f50057)")
            }
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Iniciando sesión...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-secondary mb-2" style={{ fontSize: "0.9rem", color: "#fff" }}>
            ¿No tienes una cuenta?
          </p>
          <a 
            href="/register" 
            style={{ 
              color: "#fff", 
              textDecoration: "none",
              fontWeight: "bold"
            }}
            onMouseOver={(e) => e.target.style.color = "#4dd0e1"}
            onMouseOut={(e) => e.target.style.color = "#fff"}
          >
            <i className="bi bi-person-plus me-1"></i>
            Regístrate aquí
          </a>
        </div>

        <div className="text-center mt-3">
          <small security="true" style={{ color: "#ccc" }}>
            <i className="bi bi-shield-check me-1"></i>
            Tus datos están protegidos y seguros
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
