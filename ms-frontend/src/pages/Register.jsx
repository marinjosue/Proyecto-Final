import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "animate.css";

const Register = () => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // Removido el .trim() para permitir espacios mientras escribes
    });
  };

  const validateForm = () => {
    // Aplicar trim solo para validación, no afecta el estado
    const trimmedData = {
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      correo: formData.correo.trim(),
      password: formData.password.trim()
    };
    
    if (!trimmedData.nombres || !trimmedData.apellidos || !trimmedData.correo || !trimmedData.password) {
      return "Todos los campos son obligatorios ⚠️";
    }
    if (!/\S+@\S+\.\S+/.test(trimmedData.correo)) {
      return "El correo electrónico no es válido 📧";
    }
    if (trimmedData.password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres 🔒";
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
      // Preparar datos con trim para enviar al servidor
      const dataToSend = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correo: formData.correo.trim(),
        password: formData.password.trim()
      };
      
      console.log("Datos a enviar:", dataToSend);
      const result = await register(dataToSend);
      
      if (result.success) {
        setMessage({ 
          type: "success", 
          text: "¡Registro exitoso! Bienvenido a la plataforma." 
        });
        
        // Clear form after successful registration
        setFormData({ 
          nombres: "", 
          apellidos: "", 
          correo: "", 
          password: "" 
        });

        // Redirect after a delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        console.error("Error del servidor:", result.message);
        setMessage({ type: "error", text: result.message || "Error al registrar usuario" });
      }
    } catch (error) {
      console.error('Registration error details:', error);
      
      let errorMessage = "Ocurrió un error al registrar el usuario 🚨";
      
      if (error.response) {
        // Error del servidor (400, 500, etc.)
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        errorMessage = error.response.data?.message || `Error del servidor (${error.response.status})`;
      } else if (error.request) {
        // Error de red (no se pudo conectar al servidor)
        console.error("Network error:", error.request);
        errorMessage = "Error de conexión. Verifica que el servidor esté funcionando.";
      } else {
        // Otro tipo de error
        console.error("Error:", error.message);
        errorMessage = error.message;
      }
      
      setMessage({ type: "error", text: errorMessage });
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
          maxWidth: "450px",
          backgroundColor: "#111",
          borderRadius: "15px",
          color: "#fff",
        }}
      >
        <h3 className="text-center mb-4" style={{ color: "#00bcd4" }}>
          Crear Cuenta
        </h3>

        {message.text && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombres</label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              className="form-control"
              placeholder="Ingresa tus nombres"
              style={{
                backgroundColor: "#222",
                border: "1px solid #444",
                color: "#fff",
              }}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Apellidos</label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              className="form-control"
              placeholder="Ingresa tus apellidos"
              style={{
                backgroundColor: "#222",
                border: "1px solid #444",
                color: "#fff",
              }}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="form-control"
              placeholder="Ingresa tu correo"
              style={{
                backgroundColor: "#222",
                border: "1px solid #444",
                color: "#fff",
              }}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Crea una contraseña"
              style={{
                backgroundColor: "#222",
                border: "1px solid #444",
                color: "#fff",
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn w-100 mt-3"
            disabled={loading}
            style={{
              background: "linear-gradient(90deg, #00bcd4, #673ab7)",
              border: "none",
              color: "#fff",
              fontWeight: "bold",
              transition: "0.3s",
            }}
            onMouseOver={(e) =>
              (e.target.style.background = "linear-gradient(90deg, #673ab7, #00bcd4)")
            }
            onMouseOut={(e) =>
              (e.target.style.background = "linear-gradient(90deg, #00bcd4, #673ab7)")
            }
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center mt-3 text-secondary" style={{ fontSize: "0.9rem" }}>
          ¿Ya tienes cuenta?{" "}
          <a href="/login" style={{ color: "#ff4081" }}>
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
