import React from 'react';
import './AuraMision.css';
import Header from '../components/Header'; 

const AuraMision = ({ adminUser, VITE_API_URL, onLogout }) => {
  return (
    <>
      <Header adminUser={adminUser} VITE_API_URL={VITE_API_URL} onLogout={onLogout} />

      <div className="aura-mision-container">
        <div className="aura-mision-content">
          <h2 className="aura-mision-label">✨ Misión</h2>
          <p className="aura-mision-text">
            A través de <strong>AURA</strong>, facilitamos a las empresas la publicación de vacantes, el seguimiento de procesos de selección, la gestión documental de empleados, el control de asistencia y la generación de reportes analíticos que respalden la toma de decisiones estratégicas.
          </p>
        </div>
        <div className="aura-mision-image">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135789.png"
            alt="Misión Aura"
          />
        </div>
      </div>
    </>
  );
};

export default AuraMision;
