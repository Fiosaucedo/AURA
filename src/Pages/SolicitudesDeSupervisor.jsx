import React, { useEffect, useState } from 'react';
import './SolicitudesDeSupervisor.css';
import { FaCheckCircle, FaEdit, FaClock, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../components/Header';

const API_URL = import.meta.env.VITE_API_URL;

const SolicitudesDeSupervisor = () => {
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        title: 'Debes iniciar sesión',
        text: 'Por favor iniciá sesión para acceder a esta sección.',
        icon: 'error',
        confirmButtonText: 'Ir al login'
      }).then(() => {
        window.location.href = '/login';
      });
      setLoading(false); 
      return;
    }

    const fetchData = async () => { 
      setLoading(true); 
      try {
        // Fetch User
        const userRes = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();
        if (!['recruiter'].includes(userData.role)) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No tenés permiso para acceder a esta sección.',
            confirmButtonText: 'Ir al login'
          }).then(() => {
            navigate("/login");
          });
          setLoading(false); 
          return;
        }
        setAdminUser(userData);

        
        const statuses = ['requested', 'in_review', 'corrections_requested'];
        let allJobs = [];

        for (const status of statuses) {
          const response = await fetch(`${API_URL}/job-posts/by-status/${status}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!response.ok) continue;

          const data = await response.json();
          const withStatus = data.map(job => ({
            ...job,
            estado: status,
            comentarios: job.status?.comment || null
          }));

          allJobs = allJobs.concat(withStatus);
        }

        setJobs(allJobs);
      } catch (error) {
        console.error("Error loading data:", error);
       
        Swal.fire({
          icon: 'error',
          title: 'Error de carga',
          text: 'Hubo un problema al cargar las solicitudes. Por favor, intentá de nuevo más tarde.'
        });
      } finally {
        setLoading(false); 
      }
    };

    fetchData(); 
  }, []);

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

  const showFormularioCompletar = (data) => {
    let selectedSkills = [];

    Swal.fire({
  title: 'Completar puesto solicitado',
  html: `
    <div style="display: flex; gap: 20px; min-height: 400px; max-height: 600px; overflow-y: auto;">
      <!-- Columna izquierda -->
      <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
        <input id="job-title" class="swal2-input" placeholder="Título del puesto" value="${data.title || ''}" readonly>
        <input id="job-location" class="swal2-input" placeholder="Ubicación" value="${data.location || ''}" readonly>
        <input id="job-type" class="swal2-input" placeholder="Tipo de jornada" value="${data.job_type || ''}" readonly>
        <input id="job-salary" class="swal2-input" placeholder="Remuneración ofrecida" value="${data.salary_offer || ''}">
        <input id="job-experience" class="swal2-input" placeholder="Años de experiencia" value="${data.required_experience_years || ''}" type="number" min="0">
        <input id="job-education" class="swal2-input" placeholder="Nivel educativo" value="${data.required_education_level || ''}">
        <input id="skills-input" class="swal2-input" placeholder="Habilidad y enter">
        <div id="selected-skills" style="display: flex; flex-wrap: wrap; gap: 5px; padding: 5px 0;"></div>
      </div>

      <!-- Columna derecha -->
      <div style="flex: 1; display: flex; flex-direction: column; gap: 10px; justify-content: center; align-items: center;">
        <textarea id="job-description" class="swal2-textarea" placeholder="Descripción del puesto" style="height: 263px; width: 432px;"></textarea>
        <label for="aptThresholdSlider">Umbral de aptitud (%): <span id="aptThresholdVal">70</span>%</label>
        <input type="range" min="20" max="100" value="70" id="aptThresholdSlider" class="swal2-range">
      </div>
    </div>
 <style>
  input[type="range"] {
    -webkit-appearance: none;
    width: 80%;
    height: 8px;
    background: #d3d3d3;
    border-radius: 5px;
    outline: none;
    transition: background 0.3s;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background:rgb(18, 83, 158);
    cursor: pointer;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
    transition: background 0.3s ease;
  }

  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background:rgb(9, 72, 145);
    cursor: pointer;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
    transition: background 0.3s ease;
  }

  input[type="range"]:hover {
    background: #c1c1c1;
  }
</style> `,
  width: '1000px',
  showCancelButton: true,
  confirmButtonText: 'Enviar',
  didOpen: () => {
    const skillsInput = Swal.getPopup().querySelector('#skills-input');
    const skillsContainer = Swal.getPopup().querySelector('#selected-skills');
    const thresholdSlider = Swal.getPopup().querySelector('#aptThresholdSlider');

    thresholdSlider.addEventListener('input', () => {
      Swal.getPopup().querySelector('#aptThresholdVal').textContent = thresholdSlider.value;
    });

        const renderSkillTag = (skill) => {
          const span = document.createElement('span');
          span.textContent = skill;

          span.className = 'selected-skill-tag';
 

          const btnRemove = document.createElement('button');
          btnRemove.type = 'button';
          btnRemove.className = 'btn-remove-skill';
          btnRemove.innerHTML = '&times;';

          btnRemove.addEventListener('click', () => {
            skillsContainer.removeChild(span);
            selectedSkills = selectedSkills.filter(s => s !== skill);
          });

          span.appendChild(btnRemove);
          return span;
        };

        skillsInput.addEventListener('keydown', e => {
          if (e.key === 'Enter' && skillsInput.value.trim()) {
            e.preventDefault();
            const skill = skillsInput.value.trim();

            if (!selectedSkills.includes(skill)) {
              selectedSkills.push(skill);
              const skillTag = renderSkillTag(skill);
              skillsContainer.appendChild(skillTag);
            }
            skillsInput.value = '';
          }
        });
      },
      preConfirm: () => {
        const description = document.getElementById('job-description').value;
        const salary = document.getElementById('job-salary').value;
        const experience = document.getElementById('job-experience').value;
        const education = document.getElementById('job-education').value;
        const thresholdSlider = document.getElementById('aptThresholdSlider');
        const threshold = parseInt(thresholdSlider.value, 10) / 100;

        if (!description || selectedSkills.length === 0) {
          Swal.showValidationMessage('Faltan campos obligatorios: descripción y al menos una habilidad');
          return false;
        }

        return {
          description,
          salary_offer: salary,
          required_experience_years: parseInt(experience, 10),
          required_education_level: education,
          tags: selectedSkills,
          apt_score_threshold: threshold
        };
      }
    }).then(async result => {
      if (!result.isConfirmed) return;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/complete-job/${data.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...result.value, comment: 'Completado por reclutador' })
        });

        if (!res.ok) throw new Error('Error al completar el puesto');

        Swal.fire('Listo', 'Puesto completado y enviado al supervisor', 'success');

        setJobs(prevJobs => prevJobs.map(job =>
          job.id === data.id
            ? {
              ...job,
              estado: 'in_review',
              salary_offer: result.value.salary_offer,
              required_experience_years: result.value.required_experience_years,
              required_education_level: result.value.required_education_level,
              skills_required: result.value.tags.join(', '),
            }
            : job
        ));
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    });
  };

  const renderIcon = (estado) => {
    switch (estado) {
      case 'approved': return <FaCheckCircle />;
      case 'corrections_requested': return <FaEdit />;
      default: return <FaClock />;
    }
  };

  const renderLabel = (estado) => {
    switch (estado) {
      case 'approved': return 'Aprobado';
      case 'corrections_requested': return 'Modificaciones solicitadas';
      case 'requested': return 'Solicitado por supervisor';
      case 'in_review': return 'Pendiente de revisión';
      default: return estado;
    }
  };

  return (
    <div className="solicitudes-container">
      <Header adminUser={adminUser} onLogout={handleLogout} VITE_API_URL={API_URL} />
      <h2 className="titulo-seccion">Solicitudes de Busqueda</h2>

      
      {loading ? (
        <div className="loading-solicitudes">
          <div className="spinner"></div>
        </div>
      ) : (
        jobs.length === 0 ? (
          <p className="no-solicitudes">¡No tenés solicitudes pendientes!</p>
        ) : (
          <div className="solicitudes-busquedas-lista">
            {jobs.map((solicitud) => (
              <div key={solicitud.id} className="tarjeta-solicitud">
                <h3>{solicitud.title}</h3>
                <p><strong>Ubicación:</strong> {solicitud.location}</p>
                <p><strong>Jornada:</strong> {solicitud.job_type}</p>
                <p><strong>Remuneración:</strong> {solicitud.salary_offer || '-'}</p>
                <p><strong>Experiencia requerida:</strong> {solicitud.required_experience_years || '-'}</p>
                <p><strong>Educación requerida:</strong> {solicitud.required_education_level || '-'}</p>
                <p><strong>Habilidades:</strong> {solicitud.skills_required || '-'}</p>
                <div className={`estado ${solicitud.estado}`}>
                  <span className="icono-estado">{renderIcon(solicitud.estado)}</span>
                  {renderLabel(solicitud.estado)}
                </div>
                {solicitud.comentarios && (
                  <div className="comentarios">
                    <strong>Comentarios del supervisor:</strong> {solicitud.comentarios}
                  </div>
                )}
                {(solicitud.estado === 'requested' || solicitud.estado === 'corrections_requested') && (
                  <button onClick={() => showFormularioCompletar(solicitud)} className="btn-completar">
                    Completar puesto
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default SolicitudesDeSupervisor;