import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './CertificadosEnviados.css';

const CertificadosEnviados = () => {
  const [certificados, setCertificados] = useState([]);
  const [vistaCertificados, setVistaCertificados] = useState('tarjetas');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };

    fetch(`${import.meta.env.VITE_API_URL}/certificates`, { headers })
      .then((res) => res.json())
      .then(setCertificados)
      .catch(() =>
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar certificados.',
        })
      );
  }, []);

  const verArchivo = (filePath) => {
    const url = `${import.meta.env.VITE_API_URL}/${filePath}`;
    window.open(url, '_blank');
  };

  const aprobarCertificado = (id) => {
    Swal.fire({
      title: '¿Confirmar aprobación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch(`${import.meta.env.VITE_API_URL}/certificates/approve/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ comment: 'Aprobado por el supervisor.' }),
        });
        Swal.fire({ icon: 'success', title: 'Certificado aprobado' });
        actualizarEstadoCertificado(id, 'Aprobado', 'Aprobado por el supervisor.');
      }
    });
  };

  const rechazarCertificado = (id) => {
    Swal.fire({
      title: '¿Confirmar rechazo?',
      icon: 'warning',
      input: 'textarea',
      inputLabel: 'Motivo del rechazo',
      inputPlaceholder: 'Escribe el motivo aquí...',
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      preConfirm: (comentario) => {
        if (!comentario) {
          Swal.showValidationMessage('El motivo es obligatorio');
        }
        return comentario;
      },
    }).then(async (result) => {
      const comentario = result.value;
      if (result.isConfirmed) {
        await fetch(`${import.meta.env.VITE_API_URL}/certificates/reject/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ comment: comentario }),
        });
        Swal.fire('Rechazado', 'El certificado ha sido rechazado.', 'success');
        actualizarEstadoCertificado(id, 'Rechazado', comentario);
      }
    });
  };

  const actualizarEstadoCertificado = (id, nuevoEstado, nuevoComentario) => {
    setCertificados(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, last_state: nuevoEstado, last_comment: nuevoComentario }
          : c
      )
    );
  };

  const estaEvaluado = (estado) => {
    return estado === 'Aprobado' || estado === 'Rechazado';
  };

  const iconoEstado = (estado) => {
    if (estado === 'Aprobado') return '✅';
    if (estado === 'Rechazado') return '❌';
    return '⏳';
  };

  return (
    <div className="certificados-container">
      <h2 className="certificados-title">📑 Certificados Enviados</h2>

      <div className="vista-toggle">
        <button
          className={vistaCertificados === 'tarjetas' ? 'active' : ''}
          onClick={() => setVistaCertificados('tarjetas')}
        >
          Vista Tarjetas
        </button>
        <button
          className={vistaCertificados === 'lista' ? 'active' : ''}
          onClick={() => setVistaCertificados('lista')}
        >
          Vista Lista
        </button>
      </div>

      {certificados.length === 0 && <p>No hay certificados para revisar.</p>}

      {vistaCertificados === 'tarjetas' && (
        <div className="certificados-tarjetas">
          {certificados.map((c) => (
            <div
              key={c.id}
              className={`certificado-card ${c.last_state === 'Aprobado' ? 'aprobado' : c.last_state === 'Rechazado' ? 'rechazado' : ''}`}
            >
              <h4>{c.employee_name}</h4>
              <p><strong>Inicio de licencia:</strong> {new Date(c.start_date + 'T00:00:00').toLocaleDateString('es-AR')}</p>
              <p><strong>Fin de licencia:</strong> {new Date(c.end_date + 'T00:00:00').toLocaleDateString('es-AR')}</p>
              <p><strong>Estado:</strong> {iconoEstado(c.last_state)} {c.last_state}</p>
              <p><strong>Comentario:</strong> {c.last_comment}</p>
              <div className="certificado-buttons">
                <button onClick={() => verArchivo(c.file_path)}>📄 Ver archivo</button>
                <button onClick={() => aprobarCertificado(c.id)} disabled={estaEvaluado(c.last_state)}>✅ Aprobar</button>
                <button onClick={() => rechazarCertificado(c.id)} disabled={estaEvaluado(c.last_state)}>❌ Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {vistaCertificados === 'lista' && (
        <table className="tabla-certificados" border="1">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Inicio de licencia</th>
              <th>Fin de licencia</th>
              <th>Estado</th>
              <th>Comentario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {certificados.map((c) => (
              <tr key={c.id}>
                <td>{c.employee_name}</td>
                <td>{new Date(c.start_date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                <td>{new Date(c.end_date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                <td>{iconoEstado(c.last_state)} {c.last_state}</td>
                <td>{c.last_comment}</td>
                <td>
                  <button onClick={() => verArchivo(c.file_path)}>📄 Ver</button>
                  <button onClick={() => aprobarCertificado(c.id)} disabled={estaEvaluado(c.last_state)}>✅</button>
                  <button onClick={() => rechazarCertificado(c.id)} disabled={estaEvaluado(c.last_state)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CertificadosEnviados;
