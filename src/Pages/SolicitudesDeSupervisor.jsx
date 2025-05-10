import React from 'react';
import './SolicitudesDeSupervisor.css';
import { FaCheckCircle, FaEdit, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const solicitudesSupervisor = [
  {
    id: 1,
    puesto: 'Desarrollador Full Stack',
    ubicacion: 'Buenos Aires',
    jornada: 'Completa',
    remuneracion: '$400.000',
    experiencia: '2 años en desarrollo web',
    educacion: 'Título en Ingeniería en Sistemas',
    habilidades: 'React, Node.js, MongoDB',
    estado: 'aprobado',
  },
  {
    id: 2,
    puesto: 'QA Tester',
    ubicacion: 'Remoto',
    jornada: 'Part-Time',
    remuneracion: '$250.000',
    experiencia: '1 año en testing',
    educacion: 'Analista en Sistemas',
    habilidades: 'Selenium, JIRA',
    estado: 'modificaciones',
  },
];

const propuestasReclutador = [
  {
    id: 101,
    puesto: 'Analista de Datos',
    ubicacion: 'Córdoba',
    jornada: 'Completa',
    remuneracion: '$380.000',
    experiencia: '3 años en BI',
    educacion: 'Licenciatura en Sistemas',
    habilidades: 'Power BI, SQL',
    estado: 'pendiente', // Pendiente de revisión del supervisor
  },
];

const SolicitudesDeSupervisor = () => {
  const navigate = useNavigate();

  const irAVistaReclutador = () => {
    navigate('/vista-reclutador');
  };

  const renderTarjeta = (solicitud, origen) => (
    <div key={`${origen}-${solicitud.id}`} className="tarjeta-solicitud">
      <h3>{solicitud.puesto}</h3>
      <p><strong>ID:</strong> {solicitud.id}</p>
      <p><strong>Ubicación:</strong> {solicitud.ubicacion}</p>
      <p><strong>Jornada:</strong> {solicitud.jornada}</p>
      <p><strong>Remuneración:</strong> {solicitud.remuneracion}</p>
      <p><strong>Experiencia requerida:</strong> {solicitud.experiencia}</p>
      <p><strong>Educación requerida:</strong> {solicitud.educacion}</p>
      <p><strong>Habilidades:</strong> {solicitud.habilidades}</p>

      <div className={`estado ${solicitud.estado}`}>
        <span className="icono-estado">
          {solicitud.estado === 'aprobado' ? <FaCheckCircle /> :
           solicitud.estado === 'modificaciones' ? <FaEdit /> :
           <FaClock />}
        </span>
        {solicitud.estado === 'aprobado'
          ? 'Aprobado'
          : solicitud.estado === 'modificaciones'
          ? 'Modificaciones solicitadas'
          : 'Pendiente de revisión'}
      </div>

      {solicitud.comentarios && (
        <div className="comentarios">
          <strong>Comentarios del supervisor:</strong> {solicitud.comentarios}
        </div>
      )}
    </div>
  );

  return (
    <div className="solicitudes-container">
      <div className="aura-label" onClick={irAVistaReclutador}>✨Aura✨</div>
      <h2 className="titulo-seccion">Solicitudes del Supervisor</h2>

      <div className="solicitudes-lista">
        {solicitudesSupervisor.map((s) => renderTarjeta(s, 'supervisor'))}
        {propuestasReclutador.map((s) => renderTarjeta(s, 'reclutador'))}
      </div>
    </div>
  );
};

export default SolicitudesDeSupervisor;
