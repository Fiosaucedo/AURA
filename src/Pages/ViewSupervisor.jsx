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
  const [vistaCertificados, setVistaCertificados] = useState('tarjetas');



  const abrirModal = (descripcion) => setDescripcionSeleccionada(descripcion);
  const cerrarModal = () => setDescripcionSeleccionada(null);

  const verArchivo = (path) => {
    const fullUrl = `${import.meta.env.VITE_API_URL}/${path}`;
    window.open(fullUrl, '_blank');
  };

  useEffect(() => {
    const validateUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!['supervisor', 'admin'].includes(data.role)) {
          Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tenés permiso.' })
            .then(() => navigate("/login"));
        } else setHasAccess(true);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    validateUser();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    if (solapaActiva === 'postulaciones') {
      fetch(`${import.meta.env.VITE_API_URL}/job-posts/by-status/in_review`, { headers })
        .then(res => res.json()).then(setPostulaciones)
        .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar postulaciones.' }));
    }
    if (solapaActiva === 'puestos') {
      fetch(`${import.meta.env.VITE_API_URL}/job-posts/by-status/approved`, { headers })
        .then(res => res.json()).then(setPuestos)
        .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar puestos.' }));
    }
    if (solapaActiva === 'certificados') {
      fetch(`${import.meta.env.VITE_API_URL}/certificates`, { headers })
        .then(res => res.json()).then(setCertificados)
        .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar certificados.' }));
    }
  }, [solapaActiva]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'experiencia' && Number(value) < 0) return;
    setFormulario({ ...formulario, [name]: value });
  };

  const handleJobActivation = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Cambiar estado del puesto?',
      text: 'Esto activará o desactivará el puesto.',
      icon: 'question', showCancelButton: true,
      confirmButtonText: 'Sí, continuar', cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/job-posts/handle-activation/${id}`, {
        method: 'PUT', headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error("Error actualizando estado");

      Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Estado actualizado.' });
      setSolapaActiva('');
      setTimeout(() => setSolapaActiva('puestos'), 50);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { puesto, ubicacion, jornada } = formulario;
    if (!puesto || !ubicacion || !jornada) {
      return Swal.fire({ icon: 'warning', title: 'Faltan campos', text: 'Completá los campos obligatorios.' });
    }

    const confirm = await Swal.fire({
      title: '¿Enviar solicitud?',
      icon: 'question', showCancelButton: true,
      confirmButtonText: 'Sí, enviar', cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/request-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formulario.puesto,
          location: formulario.ubicacion,
          job_type: formulario.jornada,
          salary_offer: formulario.remuneracion,
          required_experience_years: formulario.experiencia,
          required_education_level: formulario.educacion,
          skills_required: formulario.habilidades
        })
      });
      if (!res.ok) throw new Error('Error al enviar solicitud');

      Swal.fire({ icon: 'success', title: 'Solicitud enviada' });
      setFormulario({ puesto: '', ubicacion: '', jornada: '', remuneracion: '', experiencia: '', educacion: '', habilidades: '' });
      setSolapaActiva('home');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  const aprobarPostulacion = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Aprobar esta postulación?', icon: 'question',
      showCancelButton: true, confirmButtonText: 'Sí, aprobar'
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
      title: 'Solicitar cambios', input: 'textarea',
      inputLabel: 'Comentario para el reclutador', showCancelButton: true
    });
    if (!isConfirmed || !comment?.trim()) {
      return Swal.fire({ icon: 'error', title: 'Comentario inválido', text: 'Ingresá un comentario válido.' });
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

  const aprobarCertificado = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Aprobar certificado?', icon: 'question', showCancelButton: true
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
      title: 'Rechazar certificado', input: 'textarea', inputLabel: 'Motivo del rechazo',
      showCancelButton: true,
      inputValidator: value => !value.trim() ? 'El motivo es obligatorio' : null
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
        </section>
      )}

      {solapaActiva === 'formulario' && (
        <section className="formulario-section">
          <form onSubmit={handleSubmit} className="formulario">
            <h2 className="form-title">Formulario de solicitud</h2>
            <input type="text" name="puesto" placeholder="Puesto" value={formulario.puesto} onChange={handleChange} required />
            <input type="text" name="ubicacion" placeholder="Ubicación del trabajo" value={formulario.ubicacion} onChange={handleChange} required />
            <select name="jornada" value={formulario.jornada} onChange={handleChange} required>
              <option value="">Tipo de jornada</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Freelance">Freelance</option>
            </select>
            <input type="text" name="remuneracion" placeholder="Remuneración ofrecida (opcional)" value={formulario.remuneracion} onChange={handleChange} />
            <input type="number" name="experiencia" placeholder="Años de experiencia requeridos" value={formulario.experiencia} onChange={handleChange} min="0" />
            <select name="educacion" value={formulario.educacion} onChange={handleChange} required>
              <option value="">Nivel de estudios</option>
              <option value="secundario">Secundario</option>
              <option value="terciario">Terciario</option>
              <option value="universitario">Universitario</option>
            </select>
            <textarea name="habilidades" placeholder="Habilidades requeridas" value={formulario.habilidades} onChange={handleChange} required />
            <div className="botones-form">
              <button type="submit">Enviar solicitud</button>
              <button type="button" className="volver" onClick={() => setSolapaActiva('home')}>Volver</button>
            </div>
          </form>
        </section>
      )}

      {solapaActiva === 'postulaciones' && (
        <section className="postulaciones-section">
          {postulacionesReclutador.length === 0 && <p>No hay postulaciones para revisar.</p>}
          {postulacionesReclutador.map((post, index) => (
            <div key={index} className={`postulacion-card estado-${post.status?.status}`}>
              <h3>{post.title}</h3>
              <p><strong>Ubicación:</strong> {post.location}</p>
              <p><strong>Jornada:</strong> {post.job_type}</p>
              <p><strong>Experiencia requerida:</strong> {post.required_experience_years} años</p>
              <p><strong>Educación requerida:</strong> {post.required_education_level}</p>
              <p><strong>Remuneración:</strong> {post.salary_offer}</p>
              <p><strong>Habilidades requeridas:</strong> {post.skills_required}</p>
              <p><strong>Descripción:</strong> {post.description}</p>
              <p><strong>Estado:</strong> {post.status?.label}</p>
              {post.status?.comment && (
                <p><strong>Comentario:</strong> {post.status.comment}</p>
              )}
              <div className="buttons">
                <button onClick={() => aprobarPostulacion(post.id)}>Aprobar</button>
                <button onClick={() => solicitarCambios(post.id)}>Solicitar cambios</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {solapaActiva === 'certificados' && (
        <section className="certificados-section">
          <div className="vista-toggle">
            <button className={vistaCertificados === 'tarjetas' ? 'active' : ''} onClick={() => setVistaCertificados('tarjetas')}>Vista Tarjetas</button>
            <button className={vistaCertificados === 'lista' ? 'active' : ''} onClick={() => setVistaCertificados('lista')}>Vista Lista</button>
          </div>

          {certificados.length === 0 && <p>No hay certificados para revisar.</p>}

          {vistaCertificados === 'tarjetas' && (
            <div className="certificados-tarjetas">
              {certificados.map(c => (
                <div key={c.id} className="certificado-card">
                  <h4>{c.employee_name}</h4>
                  <p><strong>Fecha del certificado:</strong> {new Date(c.certificate_date).toLocaleDateString()}</p>
                  <p><strong>Estado:</strong> {c.last_state}</p>
                  <p><strong>Comentario:</strong> {c.last_comment}</p>
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
                  <p><strong>Fecha del certificado:</strong> </p>
                  <th>Estado</th>
                  <th>Comentario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {certificados.map(c => (
                  <tr key={c.id}>
                    <td>{c.employee_name}</td>
                    <td>{new Date(c.certificate_date).toLocaleDateString()}</td>
                    <p><strong>Estado:</strong> {c.last_state}</p>
                    <p><strong>Comentario:</strong> {c.last_comment}</p>
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
        </section>
      )}

      {descripcionSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Descripción del puesto</h3>
            <p>{descripcionSeleccionada}</p>
            <button onClick={cerrarModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );




}

export default ViewSupervisor;