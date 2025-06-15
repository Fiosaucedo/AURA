import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './ViewEmpleado.css';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const ViewEmpleado = () => {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [certificados, setCertificados] = useState([]);
  const [vista, setVista] = useState('tarjetas');
  const [adminUser, setAdminUser] = useState(null);
   const [hasAccess, setHasAccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/certificates`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async res => {
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setCertificados(data);
        } else {
          console.warn("Respuesta inesperada:", data);
          setCertificados([]); // evitar crash
        }
      })
      .catch(err => {
        console.error("Error al cargar certificados:", err);
        setCertificados([]);
      });
  }, []);  

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
}, []);


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
          window.location.href = '/login';
        }
      });
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!archivoSeleccionado || !startDate || !endDate) {
        Swal.fire('Faltan datos', 'Debés seleccionar un archivo y una fecha.', 'warning');
        return;
      }
    
      const hoy = new Date();
      const desde = new Date(startDate);
      const hasta = new Date(endDate);
      if (
        (desde.getMonth() < hoy.getMonth() || hasta.getMonth() < hoy.getMonth()) &&
        hoy.getDate() > 5
      ) {
        Swal.fire('Error', 'No podés subir certificados del mes anterior porque el período está cerrado.', 'error');
        return;
      }
    
      const formData = new FormData();
      formData.append('file', archivoSeleccionado);
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
    
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
          const nuevaRespuesta = await fetch(`${API_URL}/certificates`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const nuevosCertificados = await nuevaRespuesta.json();
          setCertificados(nuevosCertificados);
        } else {
          Swal.fire('Error', data.error || 'Hubo un problema al subir el certificado.', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Error de red al subir el archivo.', 'error');
      }
    };
    

  return (
    <div className="empleado-container">
     <Header adminUser={adminUser} onLogout={handleLogout} VITE_API_URL={API_URL}/>

      <section className="enviar-certificado">
        <h2>Enviar Nuevo Certificado</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-archivo">
            <label>Archivo:</label>
            <input
              type="file"
              onChange={handleArchivoSeleccionado}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>
          <div className="input-fecha">
            <label>Desde:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="input-fecha">
            <label>Hasta:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button type="submit" className="boton-enviar">Enviar</button>
        </form>
      </section>

      <section className="ver-solicitudes">
        <h2>Mis Certificados</h2>
        <div className="selector-vista">
          <button className={vista === 'tarjetas' ? 'activo' : ''} onClick={() => setVista('tarjetas')}>
            Vista en Tarjetas
          </button>
          <button className={vista === 'lista' ? 'activo' : ''} onClick={() => setVista('lista')}>
            Vista en Lista
          </button>
        </div>

        {vista === 'tarjetas' ? (
          <div className="solicitudes-tarjetas">
            {Array.isArray(certificados) && certificados.map(cert => {
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
                      Ver
                    </button>
                  </p>
                  <p><strong>Fecha Inicio:</strong> {new Date(cert.start_date + 'T00:00:00').toLocaleDateString('es-AR')}</p>
                  <p><strong>Fecha Fin:</strong> {new Date(cert.end_date + 'T00:00:00').toLocaleDateString('es-AR')}</p>
                  <p><strong>Último Estado:</strong> {ultimoEstado?.state}</p>
                  <p><strong>Comentario:</strong> {ultimoEstado?.comment}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="tabla-wrapper">
            <table className="tabla-certificados">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Estado</th>
                  <th>Comentario</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(certificados) && certificados.map(cert => (
                  <tr key={cert.id} className={`fila-estado-${(cert.last_state || '').toLowerCase()}`}>
                    <td>
                      <button
                        onClick={() => window.open(`${API_URL}/${cert.file_path}`, '_blank')}
                        className="ver-boton"
                      >
                        Ver
                      </button>
                    </td>
                    <td>{cert.start_date}</td>
                    <td>{cert.end_date}</td>
                    <td>{cert.last_state}</td>
                    <td>{cert.last_comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ViewEmpleado;
