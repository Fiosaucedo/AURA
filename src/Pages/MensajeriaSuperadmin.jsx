import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import './MensajeriaSuperadmin.css';

const MensajeriaSuperadmin = ({ adminUser, onLogout }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [mensajes, setMensajes] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroMotivo, setFiltroMotivo] = useState('');

  useEffect(() => {
    fetchMensajes();
  }, []);
  
  const fetchMensajes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/contact`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      const data = await response.json();
  
      if (Array.isArray(data)) {
        setMensajes(data);
      } else {
        console.error('Respuesta inesperada del servidor:', data);
        setMensajes([]);
      }
    } catch (error) {
      console.error('Error al obtener los mensajes de contacto:', error);
      setMensajes([]);
    }
  };
  

  const tiposUnicos = [...new Set(mensajes.map(msg => msg.userType))];
  const motivosUnicos = [...new Set(mensajes.map(msg => msg.reason))];

  const mensajesFiltrados = mensajes.filter(msg => {
    return (
      (filtroTipo ? msg.userType === filtroTipo : true) &&
      (filtroMotivo ? msg.reason === filtroMotivo : true)
    );
  });

  return (
    <div className="mensajeria-superadmin">
      <Header
        adminUser={adminUser}
        VITE_API_URL={API_URL}
        onLogout={onLogout}
        ocultarLandingNav={true}
      />

      <main className="mensajeria-contenido">
        <h1>📨 Sugerencias y Reclamos Recibidos</h1>

        <div className="filtros-mensajeria">
          <select onChange={e => setFiltroTipo(e.target.value)} value={filtroTipo}>
            <option value="">Todos los tipos</option>
            {tiposUnicos.map((tipo, idx) => (
              <option key={idx} value={tipo}>{tipo}</option>
            ))}
          </select>

          <select onChange={e => setFiltroMotivo(e.target.value)} value={filtroMotivo}>
            <option value="">Todos los motivos</option>
            {motivosUnicos.map((motivo, idx) => (
              <option key={idx} value={motivo}>{motivo}</option>
            ))}
          </select>
        </div>

        {mensajesFiltrados.length === 0 ? (
          <p className="no-mensajes">No hay mensajes por el momento.</p>
        ) : (
          <div className="tarjetas-mensajes">
            {mensajesFiltrados.map((msg, idx) => (
              <div className={`tarjeta-mensaje motivo-${msg.reason.toLowerCase()}`} key={idx}>
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
