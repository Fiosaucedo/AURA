import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './ViewSupervisor.css';
import { useNavigate } from 'react-router-dom';

function ViewSupervisor() {
  const navigate = useNavigate();

  const [hasAccess, setHasAccess] = useState(false); // Protección
  const [puestos, setPuestos] = useState([])
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

  useEffect(() => {
    const validateUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (data.role !== 'supervisor') {
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
    if (solapaActiva !== 'postulaciones') return;

    fetch(`${import.meta.env.VITE_API_URL}/job-posts/by-status/in_review`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setPostulaciones(data))
      .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las postulaciones.' }));
  }, [solapaActiva]);

  useEffect(() => {
    if (solapaActiva !== 'puestos') return;

    fetch(`${import.meta.env.VITE_API_URL}/job-posts/by-status/approved`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setPuestos(data))
      .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los puestos.' }));
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del puesto.'
      });
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
      setFormulario({ puesto: '', ubicacion: '', jornada: '', remuneracion: '', experiencia: '', habilidades: '' });
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

  if (!hasAccess) return null; // ⛔ Evita renderizado antes de validación

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
                <th>Titulo del puesto</th>
                <th>Descripción</th>
                <th>Fecha de creación</th>
                <th>Cantidad de postulantes</th>
                <th>Cantidad de aptos</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            {puestos
              .map((p, i) => (
                <tr key={i}>
                  <td>{p.title}</td>
                  <td>{p.description}</td>
                  <td>{p.created_at}</td>
                  <td>{p.candidates}</td>
                  <td>{p.apt_candidates}</td>
                  <td className={p.is_active ? 'active' : 'hide'}>{p.is_active ? 'En curso' : 'Deshabilitada'}</td>
                  <td><button onClick={() => handleJobActivation(p.id)}>{p.is_active ? 'Deshabilitar' : 'Activar'}</button></td>
                </tr>
              ))}
          </table>
        </section>
      )}


      {solapaActiva === 'formulario' && (
        <div className="supervisor-formulario">
          <h2 className="form-title">Formulario de solicitud</h2>
          <form onSubmit={handleSubmit} className="formulario">
            <input type="text" name="puesto" placeholder="Puesto" value={formulario.puesto} onChange={handleChange} required />
            <input type="text" name="ubicacion" placeholder="Ubicación del trabajo" value={formulario.ubicacion} onChange={handleChange} required />
            <select name="jornada" value={formulario.jornada} onChange={handleChange} required>
              <option value="">Tipo de jornada</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
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
        </div>
      )}

      {solapaActiva === 'postulaciones' && (
        <div className="supervisor-postulaciones">
          <h2 className="supervisor-title">Postulaciones del reclutador</h2>
          {postulacionesReclutador.map((post) => (
            <div key={post.id} className="supervisor-card">
              <h3>{post.title}</h3>
              <p><strong>Ubicación:</strong> {post.location || 'No especificada'}</p>
              <p><strong>Tipo de jornada:</strong> {post.job_type || 'No especificada'}</p>
              <p><strong>Remuneración ofrecida:</strong> {post.salary_offer || 'No especificada'}</p>
              <p><strong>Años de experiencia requeridos:</strong> {post.required_experience_years || 'No especificado'}</p>
              <p><strong>Nivel educativo requerido:</strong> {post.required_education_level || 'No especificado'}</p>
              <div className="botones-form">
                <button onClick={() => aprobarPostulacion(post.id)}>Aprobar</button>
                <button onClick={() => solicitarCambios(post.id)} className="volver">Solicitar cambios</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewSupervisor;
