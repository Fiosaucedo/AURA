import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext.jsx";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const { handleLogin } = useContext(AuthContext);
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmitLogin = async (data) => {
    setLoading(true);
    setAlertMessage("");

    try {
      const response = await fetch(`${VITE_API_URL}/login-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);


        if (handleLogin) {
          handleLogin(result.token);
        }

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
            headers: {
              Authorization: `Bearer ${result.token}`
            }
          });

          const data = await res.json();
          console.log(data)
          if (result.must_change_password) {
            setTimeout(() => {
              navigate("/cambiar-password");
            }, 500);
          } else if (data.role === 'supervisor') {
            setTimeout(() => {
              navigate("/vista-supervisor");
            }, 500);
          } else if (data.role === 'admin') {
            setTimeout(() => {
              navigate("/vista-admin");
            }, 500);
          } else if (data.role === 'receptionist') {
            setTimeout(() => {
              navigate("/vista-recepcionista");
            }, 500);
          } else if (data.role === 'recruiter') {
            setTimeout(() => {
              navigate("/vista-reclutador");
            }, 500);
          } else {
            setTimeout(() => {
              navigate("/");
            }, 500);
          }

        } catch (err) {
          console.error(err);
        }

      } else {
        setAlertMessage(result.message || "Error al iniciar sesión");
        setAlertType("error");
      }
    } catch (error) {
      console.error("Error de login:", error);
      setAlertMessage("Ocurrió un error inesperado");
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitReset = async (data) => {
    setLoading(true);
    setAlertMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/recovery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });
      
      if (response.ok) {
        setAlertMessage("Si el correo está registrado, se ha enviado un enlace de recuperación.");
        setAlertType("success");
        setTimeout(() => {
          setResetPasswordMode(false);
          reset();
        }, 3000);
      } else {
        setAlertMessage("Ocurrió un error inesperado. Intentelo de nuevo más tarde.");
        setAlertType("error");
      }
    } catch (error) {
      console.error("Error verificando email:", error);
      setAlertMessage("Ocurrió un error. Intenta de nuevo.");
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Label arriba a la izquierda */}
      <div className="aura-label" onClick={() => navigate("/home")}>
        ✨Aura✨
      </div>

      <div className="login-form">
        <h2>{resetPasswordMode ? "Recuperar contraseña" : "Iniciar sesión"}</h2>

        <form onSubmit={handleSubmit(resetPasswordMode ? onSubmitReset : onSubmitLogin)}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              {...register("email", {
                required: "El email es obligatorio",
                pattern: {
                  value:
                    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                  message: "Ingrese un email válido",
                },
              })}
              placeholder="Ingrese su email"
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          {!resetPasswordMode && (
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "Debe tener al menos 6 caracteres",
                  },
                })}
                placeholder="Ingrese su contraseña"
              />
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>
          )}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Cargando..." : resetPasswordMode ? "Enviar enlace" : "Iniciar sesión"}
          </button>

          <div className="toggle-reset-password">
            {resetPasswordMode ? (
              <p>
                ¿Recordaste tu contraseña?{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setResetPasswordMode(false);
                    setAlertMessage("");
                    reset();
                  }}
                >
                  Volver a iniciar sesión
                </button>
              </p>
            ) : (
              <p>
                ¿Olvidaste tu contraseña?{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setResetPasswordMode(true);
                    setAlertMessage("");
                    reset();
                  }}
                >
                  Recuperar contraseña
                </button>
              </p>
            )}
          </div>

          {alertMessage && (
            <div className={`alert-message ${alertType}`}>
              {alertMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
