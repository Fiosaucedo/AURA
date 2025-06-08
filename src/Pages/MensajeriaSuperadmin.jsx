import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import './MensajeriaSuperadmin.css';

const MensajeriaSuperadmin = ({ adminUser, VITE_API_URL, onLogout }) => {
  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {
    fetchMensajes();
  }, []);

  const fetchMensajes = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/contacto`);
      const data = await response.json();
      setMensajes(data);
    } catch (error) {
      console.error('Error al obtener los mensajes de contacto:', error);
    }
  };

  return (
    <div className="mensajeria-superadmin">
      <Header
        adminUser={adminUser}
        VITE_API_URL={VITE_API_URL}
        onLogout={onLogout}
        ocultarLandingNav={true}
      />

      <main className="mensajeria-contenido">
        <h1>📨 Sugerencias y Reclamos Recibidos</h1>

        {mensajes.length === 0 ? (
          <p className="no-mensajes">No hay mensajes por el momento.</p>
        ) : (
          <div className="tarjetas-mensajes">
            {mensajes.map((msg, idx) => (
              <div className="tarjeta-mensaje" key={idx}>
                <div className="cabecera-tarjeta">
                  <span className="tipo-usuario">🧑 {msg.userType}</span>
                  <span className="motivo-contacto">📌 {msg.reason}</span>
                </div>
                <h3>{msg.name}</h3>
                <p><strong>Email:</strong> {msg.email}</p>
                <p><strong>Teléfono:</strong> {msg.phone}</p>
                <p className="mensaje-texto">"{msg.message}"</p>
                <p className="fecha-recibido">📅 {new Date(msg.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MensajeriaSuperadmin;
