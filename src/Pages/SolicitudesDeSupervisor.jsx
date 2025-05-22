import React, { useEffect, useState } from 'react';
import './SolicitudesDeSupervisor.css';
import { FaCheckCircle, FaEdit, FaClock, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const SolicitudesDeSupervisor = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

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
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();

        const rol = data.role;

        if (!['recruiter', 'admin'].includes(rol)) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No tenés permiso para acceder a esta sección.',
          }).then(() => {
            navigate("/login");
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No tenés permiso para acceder a esta sección.',
          confirmButtonText: 'Ir al login'
        }).then(() => {
          navigate("/login");
        });
      }
    }

    const fetchJobs = async () => {
      try {
        const statuses = ['requested', 'in_review', 'corrections_requested'];
        let allJobs = [];

        for (const status of statuses) {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/job-posts/by-status/${status}`, {
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
        console.error("Error loading jobs:", error);
      }
    };

    fetchUser();
    fetchJobs();
  }, []);

  const showFormularioCompletar = (data) => {
    let selectedSkills = [];

    Swal.fire({
      title: 'Completar puesto solicitado',
      html: `
        <input id="job-title" class="swal2-input" placeholder="Título del puesto" value="${data.title || ''}" readonly>
        <input id="job-location" class="swal2-input" placeholder="Ubicación" value="${data.location || ''}" readonly>
        <input id="job-type" class="swal2-input" placeholder="Tipo de jornada" value="${data.job_type || ''}" readonly>
        <input id="job-salary" class="swal2-input" placeholder="Remuneración ofrecida" value="${data.salary_offer || ''}">
        <input id="job-experience" class="swal2-input" placeholder="Años de experiencia" value="${data.required_experience_years || ''}" type="number" min="0">
        <input id="job-education" class="swal2-input" placeholder="Nivel educativo" value="${data.required_education_level || ''}">
        <input id="skills-input" class="swal2-input" placeholder="Habilidad y enter">
        <div id="selected-skills" style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 5px;"></div>
        <textarea id="job-description" class="swal2-textarea" placeholder="Descripción del puesto"></textarea>
      `,
      width: '1000px',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      didOpen: () => {
        const skillsInput = Swal.getPopup().querySelector('#skills-input');
        const skillsContainer = Swal.getPopup().querySelector('#selected-skills');

        const renderSkillTag = (skill) => {
          const span = document.createElement('span');
          span.textContent = skill;

          span.className = 'selected-skill-tag';
          span.style.display = 'inline-flex';
          span.style.alignItems = 'center';
          span.style.padding = '2px 6px';
          span.style.borderRadius = '12px';
          span.style.backgroundColor = '#007bff';
          span.style.color = 'white';
          span.style.fontSize = '0.9em';
          span.style.cursor = 'default';

          const btnRemove = document.createElement('button');
          btnRemove.type = 'button';
          btnRemove.style.marginLeft = '6px';
          btnRemove.style.background = 'transparent';
          btnRemove.style.border = 'none';
          btnRemove.style.color = 'white';
          btnRemove.style.cursor = 'pointer';
          btnRemove.title = 'Eliminar habilidad';
          btnRemove.innerHTML = '&times;'; // × symbol

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

            // Evitar habilidades duplicadas
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

        if (!description || selectedSkills.length === 0) {
          Swal.showValidationMessage('Faltan campos obligatorios: descripción y al menos una habilidad');
          return false;
        }

        return {
          description,
          salary_offer: salary,
          required_experience_years: parseInt(experience, 10),
          required_education_level: education,
          tags: selectedSkills
        };
      }
    }).then(async result => {
      if (!result.isConfirmed) return;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/complete-job/${data.id}`, {
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
      <div className="aura-label" onClick={() => navigate('/vista-reclutador')}>✨Aura✨</div>
      <h2 className="titulo-seccion">Solicitudes del Supervisor</h2>
      <div className="solicitudes-lista">
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
    </div>
  );
};

export default SolicitudesDeSupervisor;
