import React, { useState } from 'react';
import './ViewEmpleado.css';
import Swal from 'sweetalert2'; // Importa SweetAlert2

const solicitudesIniciales = [
  { id: 1, archivo: 'certificado_medico_juan.pdf', fechaEnvio: '2025-05-15', estado: 'Aprobado' },
  { id: 2, archivo: 'justificativo_reunion.docx', fechaEnvio: '2025-05-16', estado: 'En proceso' },
  { id: 3, archivo: 'examen_final.jpg', fechaEnvio: '2025-05-17', estado: 'Rechazado' },
];

function ViewEmpleado() {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales);
  const [vista, setVista] = useState('tarjetas'); // 'tarjetas' o 'lista'

  const handleArchivoSeleccionado = (event) => {
    setArchivoSeleccionado(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (archivoSeleccionado) {
      Swal.fire({
        title: '¿Estás seguro de enviar este certificado?',
        text: `Archivo: ${archivoSeleccionado.name}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const nuevaSolicitud = {
            id: Date.now(),
            archivo: archivoSeleccionado.name,
            fechaEnvio: new Date().toLocaleDateString(),
            estado: 'En proceso',
          };
          setSolicitudes([...solicitudes, nuevaSolicitud]);
          setArchivoSeleccionado(null);
          Swal.fire({
            title: '¡Enviado!',
            text: `El archivo "${nuevaSolicitud.archivo}" se ha enviado correctamente.`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            customClass: {
              confirmButton: 'swal2-confirm-custom',
            },
          });
        }
      });
    } else {
      Swal.fire({
        title: '¡Ups!',
        text: 'Por favor, selecciona un archivo.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        customClass: {
          confirmButton: 'swal2-confirm-custom',
        },
      });
    }
  };

  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista);
  };

  return (
    <div className="empleado-container">
      <header className="empleado-header">
        <span className="logo-aura">✨Aura✨</span>
        <h1>Solicitud de Certificados</h1>
      </header>

      <section className="enviar-certificado">
        <h2>Enviar Nuevo Certificado</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-archivo">
            <label htmlFor="archivo">Seleccionar Archivo:</label>
            <input
              type="file"
              id="archivo"
              onChange={handleArchivoSeleccionado}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            />
          </div>
          <button type="submit" className="boton-enviar">Enviar Certificado</button>
        </form>
      </section>

      <section className="ver-solicitudes">
        <h2>Mis Solicitudes</h2>
        <div className="selector-vista">
          <button
            className={`boton-vista ${vista === 'tarjetas' ? 'activo' : ''}`}
            onClick={() => cambiarVista('tarjetas')}
          >
            Vista en Tarjetas
          </button>
          <button
            className={`boton-vista ${vista === 'lista' ? 'activo' : ''}`}
            onClick={() => cambiarVista('lista')}
          >
            Vista en Lista
          </button>
        </div>

        {vista === 'tarjetas' ? (
          <div className="solicitudes-tarjetas">
            {solicitudes.map((solicitud) => (
              <div key={solicitud.id} className={`tarjeta-solicitud estado-${solicitud.estado.toLowerCase().replace(' ', '-')}`}>
                    <p><strong>Archivo:</strong> {solicitud.archivo}</p>
                    <p><strong>Fecha de Envío:</strong> {solicitud.fechaEnvio}</p>
                    <p><strong>Estado:</strong> {solicitud.estado}</p>
              </div>
            ))}
          </div>
        ) : (
          <table className="solicitudes-lista">
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id} className={`estado-${solicitud.estado.toLowerCase().replace(' ', '-')}`}>
                  <td>{solicitud.archivo}</td>
                  <td>{solicitud.fechaEnvio}</td>
                  <td>{solicitud.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default ViewEmpleado;