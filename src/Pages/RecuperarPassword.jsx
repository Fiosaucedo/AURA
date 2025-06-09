import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

const RecuperarPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      Swal.fire("Error", "Token de recuperación no válido", "error").then(() => {
        navigate("/login");
      });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Éxito", data.message, "success").then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire("Error", data.message || "No se pudo cambiar la contraseña", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error al conectar con el servidor", "error");
    }
  };

  return (
    <div className="login-container">
      <div className="aura-label">✨Aura✨</div>
      <div className="login-form">
        <h2>Restablecer contraseña</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nueva contraseña:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ingrese la nueva contraseña"
              required
            />
          </div>
          <button type="submit" className="login-button">
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecuperarPassword;
