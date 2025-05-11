import React from 'react';
import './SolicitudesDeSupervisor.css';
import { FaCheckCircle, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const solicitudesEjemplo = [
  {
    id: 1,
    puesto: 'Desarrollador Full Stack',
    descripcion: 'Desarrollo y mantenimiento de aplicaciones web.',
    ubicacion: 'Buenos Aires',
    jornada: 'Completa',
    remuneracion: '$400.000',
    experiencia: '2 años en desarrollo web',
    educacion: 'Título en Ingeniería en Sistemas',
    habilidades: 'React, Node.js, MongoDB',
    estado: 'aprobado',
    comentarios: '',
  },
  {
    id: 2,
    puesto: 'QA Tester',
    descripcion: 'Realizar pruebas manuales y automatizadas.',
    ubicacion: 'Remoto',
    jornada: 'Part-Time',
    remuneracion: '$250.000',
    experiencia: '1 año en testing',
    educacion: 'Analista en Sistemas',
    habilidades: 'Selenium, JIRA',
    estado: 'modificaciones',
    comentarios: 'Agregar detalle sobre frameworks de automatización.',
  },
];

const SolicitudesDeSupervisor = () => {
  const navigate = useNavigate();

  const irAVistaReclutador = () => {
    navigate('/vista-reclutador');
  };

  return (
    <div className="solicitudes-container">
      <div className="aura-label" onClick={irAVistaReclutador}>✨Aura✨</div>
      <h2 className="titulo-seccion">Solicitudes del Supervisor</h2>
      <div className="solicitudes-lista">
        {solicitudesEjemplo.map((solicitud) => (
          <div key={solicitud.id} className="tarjeta-solicitud">
            <h3>{solicitud.puesto}</h3>
            <p><strong>ID:</strong> {solicitud.id}</p>
            <p><strong>Descripción:</strong> {solicitud.descripcion}</p>
            <p><strong>Ubicación:</strong> {solicitud.ubicacion}</p>
            <p><strong>Jornada:</strong> {solicitud.jornada}</p>
            <p><strong>Remuneración:</strong> {solicitud.remuneracion}</p>
            <p><strong>Experiencia requerida:</strong> {solicitud.experiencia}</p>
            <p><strong>Educación requerida:</strong> {solicitud.educacion}</p>
            <p><strong>Habilidades:</strong> {solicitud.habilidades}</p>

            <div className={`estado ${solicitud.estado}`}>
              <span className="icono-estado">
                {solicitud.estado === 'aprobado' ? <FaCheckCircle /> : <FaEdit />}
              </span>
              {solicitud.estado === 'aprobado' ? 'Aprobado' : 'Modificaciones solicitadas'}
            </div>

            {solicitud.comentarios && (
              <div className="comentarios">
                <strong>Comentarios del supervisor:</strong> {solicitud.comentarios}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SolicitudesDeSupervisor;
