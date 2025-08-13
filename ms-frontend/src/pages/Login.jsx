import React, { useState } from "react";
import "animate.css";

const Login = () => {
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!formData.correo || !formData.password) {
      setMessage({ type: "error", text: "Por favor completa todos los campos" });
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NODE_ENV === 'development'
        ? '/api/usuarios/login'
        : 'http://localhost:8000/api/usuarios/login';

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
        throw new Error(data.message || 'Error en el inicio de sesión');
      }

      // Save the token to localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        // Redirect to dashboard or home page
        window.location.href = '/dashboard';
      }

    } catch (error) {
      console.error('Login error:', error);
      let errText = error.message || "Error al iniciar sesión";
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
          maxWidth: "400px",
          backgroundColor: "#111",
          borderRadius: "15px",
          color: "#fff",
        }}
      >
        <h3 className="text-center mb-4" style={{ color: "#ff4081" }}>
          Iniciar Sesión
        </h3>

        {message.text && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Correo Electrónico</label>
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
              placeholder="Ingresa tu contraseña"
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
              background: "linear-gradient(90deg, #ff4081, #f50057)",
              border: "none",
              color: "#fff",
              fontWeight: "bold",
              transition: "0.3s",
            }}
            onMouseOver={(e) =>
              (e.target.style.background = "linear-gradient(90deg, #f50057, #ff4081)")
            }
            onMouseOut={(e) =>
              (e.target.style.background = "linear-gradient(90deg, #ff4081, #f50057)")
            }
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center mt-3 text-secondary" style={{ fontSize: "0.9rem" }}>
          ¿No tienes una cuenta?{" "}
          <a href="/register" style={{ color: "#00bcd4" }}>
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
