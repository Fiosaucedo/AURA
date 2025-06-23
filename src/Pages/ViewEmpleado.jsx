import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './ViewEmpleado.css';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List, Eye } from 'lucide-react'; 

const ViewEmpleado = () => {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [motivo, setMotivo] = useState('');
  const [otroMotivo, setOtroMotivo] = useState('');

  const [certificados, setCertificados] = useState([]);
  const [vista, setVista] = useState('tarjetas'); 
  const [adminUser, setAdminUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch(`${API_URL}/certificates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
      
          const sortedData = data.sort((a, b) => {
           
            const dateA = new Date(a.created_at || a.issue_date || a.start_date);
            const dateB = new Date(b.created_at || b.issue_date || b.start_date);
            return dateB.getTime() - dateA.getTime(); 
          });
          setCertificados(sortedData);
        } else {
          console.warn("Respuesta inesperada:", data);
          setCertificados([]);
        }
      } catch (err) {
        console.error("Error al cargar certificados:", err);
        setCertificados([]);
      }
    };

    fetchCertificates();
  }, [API_URL, token]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!['employee'].includes(data.role)) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No tenés permiso para acceder a esta sección.',
            confirmButtonText: 'Ir al login'
          }).then(() => navigate("/login"));
          return;
        }
        setAdminUser(data);
        setHasAccess(true);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error de autenticación. Redirigiendo al login.'
        }).then(() => navigate("/login"));
      }
    };

    fetchUser();
  }, [navigate, API_URL, token]);

  const handleArchivoSeleccionado = (event) => {
    setArchivoSeleccionado(event.target.files[0]);
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!archivoSeleccionado || !startDate || !endDate || !motivo || (motivo === 'Otro' && !otroMotivo.trim())) {
      Swal.fire('Faltan datos', 'Debés seleccionar un archivo, un rango de fechas y un motivo (si es "Otro", especificarlo).', 'warning');
      return;
    }

    const hoy = new Date();
    const desde = new Date(startDate);
    const hasta = new Date(endDate);


    if (
      (desde.getFullYear() < hoy.getFullYear() || (desde.getFullYear() === hoy.getFullYear() && desde.getMonth() < hoy.getMonth())) ||
      (hasta.getFullYear() < hoy.getFullYear() || (hasta.getFullYear() === hoy.getFullYear() && hasta.getMonth() < hoy.getMonth()))
    ) {
      if (hoy.getDate() > 5) {
        Swal.fire('Error', 'No puedes subir certificados del mes anterior después del día 5.', 'error');
        return;
      }
    }


    const formData = new FormData();
    formData.append('file', archivoSeleccionado);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('reason', motivo === 'Otro' ? otroMotivo : motivo);

    try {
      const res = await fetch(`${API_URL}/certificates`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        Swal.fire('Éxito', 'Certificado subido correctamente.', 'success');
        setArchivoSeleccionado(null);
        setStartDate('');
        setEndDate('');
        setMotivo('');
        setOtroMotivo('');

     
        const nuevaRespuesta = await fetch(`${API_URL}/certificates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const nuevosCertificados = await nuevaRespuesta.json();
        const sortedNuevosCertificados = nuevosCertificados.sort((a, b) => {
          const dateA = new Date(a.created_at || a.issue_date || a.start_date);
          const dateB = new Date(b.created_at || b.issue_date || b.start_date);
          return dateB.getTime() - dateA.getTime();
        });
        setCertificados(sortedNuevosCertificados);
      } else {
        Swal.fire('Error', data.error || 'Hubo un problema al subir el certificado.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error de red al subir el archivo.', 'error');
    }
  };


  const toggleVista = () => {
    setVista(prevVista => prevVista === 'tarjetas' ? 'lista' : 'tarjetas');
  };

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="empleado-container">
      <Header adminUser={adminUser} onLogout={handleLogout} VITE_API_URL={API_URL} />

      <section className="enviar-certificado">
        <h2>Enviar Nuevo Certificado</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="input-fecha">
              <label htmlFor="startDate">Desde:</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="input-fecha">
              <label htmlFor="endDate">Hasta:</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="input-motivo">
              <label htmlFor="motivo">Motivo:</label>
              <select
                id="motivo"
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  if (e.target.value !== 'Otro') {
                    setOtroMotivo('');
                  }
                }}
              >
                <option value="">Seleccione un motivo</option>
                <option value="Gripe">Gripe</option>
                <option value="Lesion">Lesión</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {motivo === 'Otro' && (
            <div className="input-otro-motivo">
              <label htmlFor="otroMotivo">Especificar motivo:</label>
              <input
                id="otroMotivo"
                type="text"
                value={otroMotivo}
                onChange={(e) => setOtroMotivo(e.target.value)}
                placeholder="Ej: Cirugía menor, problema dental..."
              />
            </div>
          )}

          <div className="input-archivo">
            <label>Archivo:</label>
            <input
              type="file"
              onChange={handleArchivoSeleccionado}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>

          <button type="submit" className="boton-enviar">Enviar</button>
        </form>
      </section>

      <section className="ver-solicitudes">
        <h2>Mis Certificados</h2>
        <div className="selector-vista">
          
          <button onClick={toggleVista} className="toggle-view-button">
            {vista === 'tarjetas' ? (
              <>
                <List size={20} />
                
              </>
            ) : (
              <>
                <LayoutGrid size={20} />
                
              </>
            )}
          </button>
        </div>

        {vista === 'tarjetas' ? (
          <div className="solicitudes-tarjetas">
            {Array.isArray(certificados) && certificados.length > 0 ? (
              certificados.map(cert => {
                const ultimoEstado = {
                  state: cert.last_state,
                  comment: cert.last_comment
                };
                return (
                  <div key={cert.id} className={`tarjeta-solicitud estado-${ultimoEstado?.state?.toLowerCase()}`}>
                    <p>
                      <strong>Archivo:</strong>{' '}
                      <button
                        onClick={() => window.open(`${API_URL}/${cert.file_path}`, '_blank')}
                        className="ver-archivo-boton"
                      >
                        <Eye size={16} /> 
                      
                      </button>
                    </p>
                    <p><strong>Fecha Inicio:</strong> {new Date(cert.start_date + 'T00:00:00').toLocaleDateString('es-AR')}</p>
                    <p><strong>Fecha Fin:</strong> {new Date(cert.end_date + 'T00:00:00').toLocaleDateString('es-AR')}</p>
                    <p><strong>Motivo:</strong> {cert.reason || 'N/A'}</p>
                    <p><strong>Último Estado:</strong> {ultimoEstado?.state}</p>
                    <p><strong>Comentario:</strong> {ultimoEstado?.comment}</p>
                  </div>
                );
              })
            ) : (
              <p className="no-certificados-message">No hay certificados para mostrar.</p>
            )}
          </div>
        ) : (
          <div className="tabla-wrapper">
            {Array.isArray(certificados) && certificados.length > 0 ? (
              <table className="tabla-certificados">
                <thead>
                  <tr>
                    <th>Archivo</th>
                    <th>Desde</th>
                    <th>Hasta</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Comentario</th>
                  </tr>
                </thead>
                <tbody>
                  {certificados.map(cert => (
                    <tr key={cert.id} className={`fila-estado-${(cert.last_state || '').toLowerCase()}`}>
                      <td>
                        <button
                          onClick={() => window.open(`${API_URL}/${cert.file_path}`, '_blank')}
                          className="ver-boton"
                        >
                          <Eye size={16} /> 
                     
                        </button>
                      </td>
                      <td>{new Date(cert.start_date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                      <td>{new Date(cert.end_date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                      <td>{cert.reason || 'N/A'}</td>
                      <td>{cert.last_state}</td>
                      <td>{cert.last_comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-certificados-message">No hay certificados para mostrar.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ViewEmpleado;