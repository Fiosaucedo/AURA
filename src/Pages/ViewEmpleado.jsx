import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './ViewEmpleado.css';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const ViewEmpleado = () => {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [fechaCertificado, setFechaCertificado] = useState('');
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
      .then(res => res.json())
      .then(data => setCertificados(data))
      .catch(err => console.error(err));
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
    if (!archivoSeleccionado || !fechaCertificado) {
      Swal.fire('Faltan datos', 'Debés seleccionar un archivo y una fecha.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', archivoSeleccionado);
    formData.append('certificate_date', fechaCertificado);

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
        setFechaCertificado('');
        // Actualizar lista
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
            <label>Fecha del Certificado:</label>
            <input
              type="date"
              value={fechaCertificado}
              onChange={(e) => setFechaCertificado(e.target.value)}
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
            {certificados.map(cert => {
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
                  </p>                  <p><strong>Fecha Certificado:</strong> {cert.certificate_date}</p>
                  <p><strong>Último Estado:</strong> {ultimoEstado?.state}</p>
                  <p><strong>Comentario:</strong> {ultimoEstado?.comment}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <table className="solicitudes-lista">
            <thead>
              <tr>
                <th>Archivo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Comentario</th>
              </tr>
            </thead>
            <tbody>
              {certificados.map(cert => {
                const ultimoEstado = cert.history.at(-1);
                return (
                  <tr key={cert.id} className={`estado-${ultimoEstado?.state?.toLowerCase()}`}>
                    <td>
                      <button
                        onClick={() => window.open(`${API_URL}/${cert.file_path}`, '_blank')}
                        className="ver-archivo-boton"
                      >
                        Ver
                      </button>
                    </td>                    <td>{cert.certificate_date}</td>
                    <td>{ultimoEstado?.state}</td>
                    <td>{ultimoEstado?.comment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default ViewEmpleado;
