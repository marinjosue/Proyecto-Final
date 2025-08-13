// D:\Plataforma-Encuentro\ms-frontend\src\pages\Register.jsx
import React, { useState } from "react";
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
  };

  const validateForm = () => {
    if (!formData.nombres || !formData.apellidos || !formData.correo || !formData.password) {
      return "Todos los campos son obligatorios ⚠️";
    }
    if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      return "El correo electrónico no es válido 📧";
    }
    if (formData.password.length < 6) {
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
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? '/api/usuarios/register' 
        : 'http://localhost:8000/api/usuarios/register';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }
      
      setMessage({ 
        type: "success", 
        text: data.message || "¡Registro exitoso! Por favor inicia sesión." 
      });
      
      // Clear form after successful registration
      setFormData({ 
        nombres: "", 
        apellidos: "", 
        correo: "", 
        password: "" 
      });

      // Redirect to login after a delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      let errText = error.message || "Ocurrió un error al registrar el usuario 🚨";
      setMessage({ type: "error", text: errText });
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
