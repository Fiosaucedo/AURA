import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './ViewSupervisor.css';
import { useNavigate } from 'react-router-dom';

function ViewSupervisor() {
  const navigate = useNavigate();

  const [hasAccess, setHasAccess] = useState(false);
  const [puestos, setPuestos] = useState([]);
  const [descripcionSeleccionada, setDescripcionSeleccionada] = useState(null);
  const [solapaActiva, setSolapaActiva] = useState('home');
  const [formulario, setFormulario] = useState({
    puesto: '',
    ubicacion: '',
    jornada: '',
    remuneracion: '',
    experiencia: '',
    educacion: '',
    habilidades: ''
  });

  const [postulacionesReclutador, setPostulaciones] = useState([]);
  const [certificados, setCertificados] = useState([]);
  const [vistaCertificados, setVistaCertificados] = useState('tarjetas'); // 'tarjetas' o 'lista'

  const abrirModal = (descripcion) => {
    setDescripcionSeleccionada(descripcion);
  };

  const cerrarModal = () => {
    setDescripcionSeleccionada(null);
  };

  useEffect(() => {
    const validateUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        const rol = data.role;

        if (!['supervisor', 'admin'].includes(rol)) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No tenés permiso para acceder a esta sección.',
          }).then(() => navigate("/login"));
        } else {
          setHasAccess(true);
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    validateUser();
  }, []);

  useEffect(() => {
    if (solapaActiva === 'postulaciones') {
      fetch(`${import.meta.env.VITE_API_URL}/job-posts/by-status/in_review`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setPostulaciones(data))
        .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las postulaciones.' }));
    }
    if (solapaActiva === 'puestos') {
      fetch(`${import.meta.env.VITE_API_URL}/job-posts/by-status/approved`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setPuestos(data))
        .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los puestos.' }));
    }
    if (solapaActiva === 'certificados') {
      fetch(`${import.meta.env.VITE_API_URL}/certificates`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setCertificados(data))
        .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los certificados.' }));
    }
  }, [solapaActiva]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'experiencia' && Number(value) < 0) return;
    setFormulario({ ...formulario, [name]: value });
  };

  const handleJobActivation = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Cambiar estado del puesto?',
      text: 'Esto activará o desactivará el puesto según su estado actual.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/job-posts/handle-activation/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error("Error al cambiar el estado del puesto");

      Swal.fire({
        icon: 'success',
        title: '¡Estado actualizado!',
        text: 'El puesto fue activado o desactivado correctamente.'
      });

      setSolapaActiva('');
      setTimeout(() => setSolapaActiva('puestos'), 50);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado del puesto.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { puesto, ubicacion, jornada, remuneracion, experiencia, educacion, habilidades } = formulario;

    if (!puesto || !ubicacion || !jornada) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completá título, ubicación y jornada.' });
      return;
    }

    const confirmacion = await Swal.fire({
      title: '¿Enviar solicitud?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/request-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: puesto,
          location: ubicacion,
          job_type: jornada,
          salary_offer: remuneracion,
          required_experience_years: experiencia,
          required_education_level: educacion,
          skills_required: habilidades
        })
      });

      if (!response.ok) throw new Error('Error en el servidor');

      Swal.fire({ icon: 'success', title: '¡Solicitud enviada!' });
      setFormulario({ puesto: '', ubicacion: '', jornada: '', remuneracion: '', experiencia: '', educacion: '', habilidades: '' });
      setSolapaActiva('home');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
  };

  const aprobarPostulacion = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Aprobar esta postulación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;

    await fetch(`${import.meta.env.VITE_API_URL}/approve-job/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ comment: 'Aprobado por el supervisor.' })
    });

    Swal.fire({ icon: 'success', title: 'Postulación aprobada' });
    setPostulaciones(prev => prev.filter(p => p.id !== id));
  };

  const solicitarCambios = async (id) => {
    const { value: comment, isConfirmed } = await Swal.fire({
      title: 'Solicitar cambios',
      input: 'textarea',
      inputLabel: 'Escribí el comentario para el reclutador',
      showCancelButton: true
    });

    if (!isConfirmed || !comment?.trim()) {
      Swal.fire({ icon: 'error', title: 'Comentario inválido', text: 'Debe ingresar un comentario' });
      return;
    }

    await fetch(`${import.meta.env.VITE_API_URL}/request-corrections/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ comment })
    });

    Swal.fire({ icon: 'success', title: 'Cambios solicitados' });
    setPostulaciones(prev => prev.filter(p => p.id !== id));
  };

  // Nuevas funciones para certificados:
  const aprobarCertificado = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Aprobar este certificado?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;

    await fetch(`${import.meta.env.VITE_API_URL}/certificates/approve/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ comment: 'Aprobado por el supervisor.' })
    });

    Swal.fire({ icon: 'success', title: 'Certificado aprobado' });
    setCertificados(prev => prev.filter(c => c.id !== id));
  };

  const rechazarCertificado = async (id) => {
    const { value: motivo, isConfirmed } = await Swal.fire({
      title: 'Rechazar certificado',
      input: 'textarea',
      inputLabel: 'Ingrese el motivo del rechazo',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value.trim()) {
          return 'El motivo es obligatorio';
        }
      }
    });

    if (!isConfirmed) return;

    await fetch(`${import.meta.env.VITE_API_URL}/certificates/reject/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ comment: motivo })
    });

    Swal.fire({ icon: 'success', title: 'Certificado rechazado' });
    setCertificados(prev => prev.filter(c => c.id !== id));
  };

  if (!hasAccess) return null;

  return (
    <div className="supervisor-container">
      <header className="supervisor-header">
        <h1 className="supervisor-logo">✨Aura✨</h1>
        <a href="/login" className="supervisor-volver">Cerrar sesión</a>
      </header>

      <div className="supervisor-tabs">
        <button onClick={() => setSolapaActiva('home')}>🏠 Inicio</button>
        <button onClick={() => setSolapaActiva('postulaciones')}>📄 Postulaciones del reclutador</button>
        <button onClick={() => setSolapaActiva('puestos')}>🚀 Postulaciones abiertas</button>
        <button onClick={() => setSolapaActiva('certificados')}>📑 Certificados enviados</button>
      </div>

      {solapaActiva === 'home' && (
        <div className="supervisor-home">
          <h2 className="supervisor-title">Bienvenido, Supervisor</h2>
          <div className="supervisor-card-container">
            <div className="supervisor-card" onClick={() => setSolapaActiva('formulario')}>
              <h3>✍️ Enviar solicitud de creación de puesto</h3>
              <p>Solicitá al reclutador que cree un nuevo puesto.</p>
            </div>
          </div>
        </div>
      )}

      {solapaActiva === 'puestos' && (
        <section className="puestos-section">
          <table className="tabla-puestos" border="1">
            <thead>
              <tr>
                <th>Título del puesto</th>
                <th>Descripción</th>
                <th>Fecha de creación</th>
                <th>Cantidad de postulantes</th>
                <th>Cantidad de aptos</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {puestos.map((p, i) => (
                <tr key={i}>
                  <td>{p.title}</td>
                  <td className="info-cell">
                    <button className="info-button" onClick={() => abrirModal(p.description)}>i</button>
                  </td>
                  <td>{p.created_at}</td>
                  <td>{p.candidates}</td>
                  <td>{p.apt_candidates}</td>
                  <td className={p.is_active ? 'active' : 'hide'}>
                    {p.is_active ? 'En curso' : 'Deshabilitada'}
                  </td>
                  <td>
                    <button onClick={() => handleJobActivation(p.id)}>
                      {p.is_active ? 'Deshabilitar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {descripcionSeleccionada && (
            <div className="modal" onClick={cerrarModal}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={cerrarModal}>×</button>
                <p>{descripcionSeleccionada}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {solapaActiva === 'postulaciones' && (
        <section className="postulaciones-section">
          {postulacionesReclutador.length === 0 && <p>No hay postulaciones para revisar.</p>}
          {postulacionesReclutador.map((post, index) => (
            <div key={index} className="postulacion-card">
              <h3>{post.title}</h3>
              <p><strong>Nombre:</strong> {post.applicant_name}</p>
              <p><strong>Edad:</strong> {post.applicant_age}</p>
              <p><strong>Email:</strong> {post.applicant_email}</p>
              <p><strong>Estado:</strong> {post.status}</p>
              <div className="buttons">
                <button onClick={() => aprobarPostulacion(post.id)}>Aprobar</button>
                <button onClick={() => solicitarCambios(post.id)}>Solicitar cambios</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Nueva sección certificados */}
      {solapaActiva === 'certificados' && (
        <section className="certificados-section">
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
              {certificados.map(c => (
                <div key={c.id} className="certificado-card">
                  <h4>{c.employee_name}</h4>
                  <p><strong>Fecha envío:</strong> {new Date(c.sent_date).toLocaleDateString()}</p>
                  <p><strong>Tipo:</strong> {c.type}</p>
                  <p><strong>Estado:</strong> {c.status}</p>
                  <div className="certificado-buttons">
                    <button onClick={() => aprobarCertificado(c.id)}>Aprobar</button>
                    <button onClick={() => rechazarCertificado(c.id)}>Rechazar</button>
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
                  <th>Fecha envío</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {certificados.map(c => (
                  <tr key={c.id}>
                    <td>{c.employee_name}</td>
                    <td>{new Date(c.sent_date).toLocaleDateString()}</td>
                    <td>{c.type}</td>
                    <td>{c.status}</td>
                    <td>
                      <button onClick={() => aprobarCertificado(c.id)}>Aprobar</button>
                      <button onClick={() => rechazarCertificado(c.id)}>Rechazar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {solapaActiva === 'formulario' && (
        <section className="formulario-section">
          <form onSubmit={handleSubmit}>
            <h2>Solicitud de creación de puesto</h2>

            <label>
              Título del puesto:
              <input
                type="text"
                name="puesto"
                value={formulario.puesto}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Ubicación:
              <input
                type="text"
                name="ubicacion"
                value={formulario.ubicacion}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Jornada:
              <select
                name="jornada"
                value={formulario.jornada}
                onChange={handleChange}
                required
              >
                <option value="">-- Seleccione --</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
              </select>
            </label>

            <label>
              Remuneración:
              <input
                type="text"
                name="remuneracion"
                value={formulario.remuneracion}
                onChange={handleChange}
              />
            </label>

            <label>
              Experiencia requerida (años):
              <input
                type="number"
                min="0"
                name="experiencia"
                value={formulario.experiencia}
                onChange={handleChange}
              />
            </label>

            <label>
              Educación requerida:
              <input
                type="text"
                name="educacion"
                value={formulario.educacion}
                onChange={handleChange}
              />
            </label>

            <label>
              Habilidades requeridas:
              <textarea
                name="habilidades"
                value={formulario.habilidades}
                onChange={handleChange}
              />
            </label>

            <button type="submit">Enviar solicitud</button>
          </form>
        </section>
      )}
    </div>
  );
}

export default ViewSupervisor;
