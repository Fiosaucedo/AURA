import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const CambiarPassword = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ new_password: password })
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Éxito", data.message, "success").then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire("Error", data.message || "No se pudo actualizar la contraseña", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error de red al cambiar la contraseña", "error");
    }
  };

  return (
    <div className="login-container">
      <div className="aura-label">✨Aura✨</div>
      <div className="login-form">
        <h2>Cambiar contraseña</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nueva contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su nueva contraseña"
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

export default CambiarPassword;
