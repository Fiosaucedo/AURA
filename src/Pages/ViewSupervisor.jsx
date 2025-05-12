import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './ViewSupervisor.css';

function ViewSupervisor() {
  const [solapaActiva, setSolapaActiva] = useState('home');
  const [formulario, setFormulario] = useState({
    puesto: '',
    ubicacion: '',
    jornada: '',
    remuneracion: '',
    experiencia: '',
    habilidades: '',
  });

  const [postulacionesReclutador] = useState([
    {
      id: 1,
      puesto: 'Frontend Developer',
      descripcion: 'Desarrollo de interfaces con React.',
      ubicacion: 'Remoto',
      jornada: 'Full-time',
      remuneracion: '120000',
      experiencia: '2',
      educacion: 'Secundario',
      habilidades: 'React, CSS, Git',
    },
    {
      id: 2,
      puesto: 'QA Tester',
      descripcion: 'Pruebas funcionales y de regresión.',
      ubicacion: 'Buenos Aires',
      jornada: 'Part-time',
      remuneracion: '80000',
      experiencia: '1',
      educacion: 'Universitario',
      habilidades: 'Jest, Cypress, buena comunicación',
    },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'experiencia' && Number(value) < 0) return;
    setFormulario({ ...formulario, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { puesto, ubicacion, jornada, remuneracion, experiencia, habilidades } = formulario;

    if (!puesto || !ubicacion || !jornada || !habilidades) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor completá todos los campos obligatorios.' });
      return;
    }

    if (experiencia && isNaN(experiencia)) {
      Swal.fire({ icon: 'error', title: 'Error en experiencia', text: 'El campo "experiencia" debe ser un número válido.' });
      return;
    }

    if (Number(experiencia) < 0) {
      Swal.fire({ icon: 'error', title: 'Valor inválido', text: 'La experiencia no puede ser negativa.' });
      return;
    }

    if (remuneracion && !/^\d+(\.\d{1,2})?$/.test(remuneracion)) {
      Swal.fire({ icon: 'error', title: 'Remuneración inválida', text: 'Ingresá una remuneración válida o dejalo vacío.' });
      return;
    }

    const confirmacion = await Swal.fire({
      title: '¿Enviar solicitud?',
      text: '¿Estás seguro de que querés enviar esta solicitud al reclutador?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) return;

    Swal.fire({ icon: 'success', title: '¡Solicitud enviada!', text: 'Tu solicitud fue enviada con éxito.' });

    setFormulario({
      puesto: '', ubicacion: '', jornada: '',
      remuneracion: '', experiencia: '', habilidades: ''
    });

    setSolapaActiva('home');
  };

  const aprobarPostulacion = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Aprobar esta postulación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    });
    if (confirmacion.isConfirmed) {
      Swal.fire({ icon: 'success', title: 'Postulación aprobada', text: `La postulación con ID ${id} fue aprobada.` });
    }
  };

  const solicitarCambios = async (id) => {
    const { value: comentario, isConfirmed } = await Swal.fire({
      title: 'Solicitar cambios',
      input: 'textarea',
      inputLabel: 'Escribí los cambios que querés solicitar al reclutador',
      inputPlaceholder: 'Ingresá tu comentario...',
      inputAttributes: {
        'aria-label': 'Comentario para solicitar cambios'
      },
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) return;

    if (!comentario || comentario.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Comentario vacío',
        text: 'Por favor, ingresa un comentario antes de continuar.',
      });
      return; 
    }

    const confirmacion = await Swal.fire({
      title: '¿Confirmar solicitud de cambios?',
      text: `Comentario a enviar:\n\n"${comentario}"\n\n¿Estás seguro de enviarlo?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmacion.isConfirmed) {
      Swal.fire({
        icon: 'info',
        title: 'Cambios solicitados',
        text: `Se solicitaron cambios para la postulación con ID ${id}.`,
      });
    
    }
  };

  return (
    <div className="supervisor-container">
      <header className="supervisor-header">
        <h1 className="supervisor-logo">✨Aura✨</h1>
        <a href="/login" className="supervisor-volver">Cerrar sesión</a>
      </header>

      <div className="supervisor-tabs">
        <button onClick={() => setSolapaActiva('home')}>🏠 Inicio</button>
        <button onClick={() => setSolapaActiva('postulaciones')}>📄 Postulaciones del reclutador</button>
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
              <option value="Remoto">Remoto</option>
              <option value="Híbrido">Híbrido</option>
            </select>
            <input type="text" name="remuneracion" placeholder="Remuneración ofrecida (opcional)" value={formulario.remuneracion} onChange={handleChange} />
            <input type="number" name="experiencia" placeholder="Años de experiencia requeridos" value={formulario.experiencia} onChange={handleChange} min="0" />
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
              <h3>{post.puesto}</h3>
              <p><strong>Descripción:</strong> {post.descripcion}</p>
              <p><strong>Ubicación:</strong> {post.ubicacion || 'No especificada'}</p>
              <p><strong>Tipo de jornada:</strong> {post.jornada || 'No especificada'}</p>
              <p><strong>Remuneración ofrecida:</strong> {post.remuneracion || 'No especificada'}</p>
              <p><strong>Años de experiencia requeridos:</strong> {post.experiencia || 'No especificado'}</p>
              <p><strong>Nivel educativo requerido:</strong> {post.educacion || 'No especificado'}</p>
              <p><strong>Habilidades:</strong> {post.habilidades || 'No especificadas'}</p>

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
