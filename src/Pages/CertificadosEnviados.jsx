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
    window.open(filePath, '_blank');
  };

  const aprobarCertificado = (id) => {
    Swal.fire({
      title: '¿Confirmar aprobación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí podés hacer la llamada al backend para aprobar
        // Por ahora simulamos el resultado
        Swal.fire('Aprobado', 'El certificado ha sido aprobado.', 'success');
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
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí podés hacer la llamada al backend para rechazar con el comentario result.value
        Swal.fire('Rechazado', 'El certificado ha sido rechazado.', 'success');
      }
    });
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
            <div key={c.id} className="certificado-card">
              <h4>{c.employee_name}</h4>
              <p>
                <strong>Fecha del certificado:</strong>{' '}
                {new Date(c.certificate_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Estado:</strong> {c.last_state}
              </p>
              <p>
                <strong>Comentario:</strong> {c.last_comment}
              </p>
              <div className="certificado-buttons">
                <button onClick={() => verArchivo(c.file_path)}>📄 Ver archivo</button>
                <button onClick={() => aprobarCertificado(c.id)}>✅ Aprobar</button>
                <button onClick={() => rechazarCertificado(c.id)}>❌ Rechazar</button>
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
              <th>Fecha</th>
              <th>Estado</th>
              <th>Comentario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {certificados.map((c) => (
              <tr key={c.id}>
                <td>{c.employee_name}</td>
                <td>{new Date(c.certificate_date).toLocaleDateString()}</td>
                <td>{c.last_state}</td>
                <td>{c.last_comment}</td>
                <td>
                  <button onClick={() => verArchivo(c.file_path)}>📄 Ver</button>
                  <button onClick={() => aprobarCertificado(c.id)}>✅</button>
                  <button onClick={() => rechazarCertificado(c.id)}>❌</button>
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
