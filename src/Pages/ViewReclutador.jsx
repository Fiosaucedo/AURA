import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './ViewReclutador.css';
import { useNavigate } from 'react-router-dom';

const ViewReclutador = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [vistaActual, setVistaActual] = useState('candidatos');
  const [puestoFiltro, setPuestoFiltro] = useState('');
  const [puestosUnicos, setPuestosUnicos] = useState([]);
  const [filtroApto, setFiltroApto] = useState('Todos');
  const skillsList = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Teamwork', 'Leadership', 'English'];
  const [adminUser, setAdminUser] = useState(null);
  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();


  const descargarCV = (candidato, { openInNewTab = false } = {}) => {
    if (!candidato.file_path) {
      Swal.fire({
        icon: "error",
        title: "No hay CV disponible",
        text: "Este candidato no tiene un CV cargado.",
      });
      return;
    }

    const filename = candidato.file_path.split("/").pop();
    const url = `${VITE_API_URL}/${candidato.file_path}`;

    if (openInNewTab) {
      window.open(url, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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

    const fetchAdminInfo = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al cargar el usuario');
        const data = await response.json();
        setAdminUser(data);
      } catch (error) {
        console.error("Error cargando admin:", error);
      }
    };

    fetchAdminInfo();

    const fetchCandidatos = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/candidatos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al cargar los candidatos');
        const data = await response.json();
        setCandidatos(data);
        const puestos = [...new Set(data.map(c => c.job_title || 'Sin puesto'))];
        setPuestosUnicos(puestos);
      } catch (error) {
        console.error('Error cargando candidatos:', error);
      }
    };

    fetchCandidatos();
  }, []);

  const viewInfo = (index) => {
    const c = candidatos[index];
    console.log(c);
    Swal.fire({
      title: `${c.name} ${c.surname}`,
      html: `
        <p><strong>Puesto al que se postuló:</strong> ${c.job_title}</p>
        <p><strong>Años de experiencia:</strong> ${c.experience_years}</p>
        <p><strong>Nivel educativo:</strong> ${c.education_level}</p>
        <p><strong>Habilidades:</strong> ${c.keywords}</p>
        <p><strong>Teléfono:</strong> ${c.phone}</p>


      `,
      confirmButtonText: 'Cerrar'
    });
  };

  const handleAddCandidateSearch = () => {
    let selectedSkills = [];

    Swal.fire({
      title: 'Crea una nueva búsqueda',
      html: `
        <div class="popup-grid">
          <div class="left-column">
            <input id="job-title" class="swal2-input" placeholder="Título del puesto">
            <input id="job-location" class="swal2-input" placeholder="Ubicación del trabajo">
            <select id="job-type" class="swal2-input custom-select">
              <option value="" disabled selected>Tipo de jornada</option>
              <option value="Full time">Full time</option>
              <option value="Part time">Part time</option>
            </select>
            <input id="job-salary" class="swal2-input" placeholder="Remuneración ofrecida">
            <input id="job-experience" class="swal2-input" placeholder="Años de experiencia requeridos" type="number">
            <select id="job-education" class="swal2-input custom-select">
              <option value="" disabled selected>Nivel educativo requerido</option>
              <option value="Secundario">Secundario</option>
              <option value="Universitario">Universitario</option>
              <option value="Terciario">Terciario</option>
              <option value="Doctorado">Doctorado</option>
            </select>
          </div>
          <div class="right-column">
            <textarea id="job-description" class="swal2-textarea" placeholder="Descripción del puesto"></textarea>
          </div>
        </div>
 
        <div class="skcontainer"style="margin-top: 20px">
  <label style="display:block; margin-bottom:5px;">Habilidades:</label>
  <input id="skills-input" class="swal2-input" placeholder="Escribí una habilidad y presioná Enter">
  <div id="selected-skills" class="selected-skills-container"></div>
</div>
      `,
      width: '1000px',
      background: '#fff',
      customClass: {
        title: 'custom-title',
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
        popup: 'custom-popup'
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const skillsInput = Swal.getPopup().querySelector('#skills-input');
        const selectedSkillsContainer = Swal.getPopup().querySelector('#selected-skills');

        skillsInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && skillsInput.value.trim() !== '') {
            e.preventDefault();
            const skill = skillsInput.value.trim();
            if (!selectedSkills.includes(skill)) {
              selectedSkills.push(skill);

              const tag = document.createElement('span');
              tag.className = 'selected-skill-tag fade-in';
              tag.textContent = skill;

              const removeBtn = document.createElement('span');
              removeBtn.textContent = ' ✕';
              removeBtn.style.cursor = 'pointer';
              removeBtn.style.marginLeft = '5px';
              removeBtn.onclick = () => {
                selectedSkills = selectedSkills.filter(s => s !== skill);
                tag.remove();
              };

              tag.appendChild(removeBtn);
              selectedSkillsContainer.appendChild(tag);
            }
            skillsInput.value = '';
          }
        });
        const noSkillsText = Swal.getPopup().querySelector('#no-skills');

        const updateNoSkillsText = () => {
          noSkillsText.style.display = selectedSkills.length === 0 ? 'block' : 'none';
        };

        skillsListContainer.addEventListener('click', (e) => {
          if (e.target.classList.contains('skill-tag')) {
            const skill = e.target.dataset.skill;
            selectedSkills.push(skill);

            const skillElem = document.createElement('span');
            skillElem.textContent = skill;
            skillElem.className = 'selected-skill-tag fade-in';
            skillElem.dataset.skill = skill;
            selectedSkillsContainer.appendChild(skillElem);

            e.target.remove();
            updateNoSkillsText();
          }
        });

        selectedSkillsContainer.addEventListener('click', (e) => {
          if (e.target.classList.contains('selected-skill-tag')) {
            const skill = e.target.dataset.skill;
            selectedSkills = selectedSkills.filter(s => s !== skill);

            const skillTag = document.createElement('span');
            skillTag.textContent = skill;
            skillTag.className = 'skill-tag fade-in';
            skillTag.dataset.skill = skill;
            skillsListContainer.appendChild(skillTag);

            e.target.remove();
            updateNoSkillsText();
          }
        });
      },
      preConfirm: () => {
        const jobTitle = document.getElementById('job-title').value;
        const jobLocation = document.getElementById('job-location').value;
        const jobType = document.getElementById('job-type').value;
        const jobSalary = document.getElementById('job-salary').value;
        const jobDescription = document.getElementById('job-description').value;
        const experienceRequired = parseInt(document.getElementById('job-experience').value) || 0;
        const educationLevel = document.getElementById('job-education').value;

        if (!jobTitle || selectedSkills.length === 0) {
          Swal.showValidationMessage('Por favor completá el título del puesto y seleccioná al menos una habilidad.');
          return false;
        }

        return {
          jobTitle,
          jobLocation,
          jobType,
          jobSalary,
          jobDescription,
          experienceRequired,
          educationLevel,
          selectedSkills
        };
      }
    }).then(async result => {
      if (result.isConfirmed) {
        const {
          jobTitle, jobLocation, jobType, jobSalary,
          jobDescription, experienceRequired, educationLevel, selectedSkills
        } = result.value;

        try {
          const token = localStorage.getItem('token');

          const response = await fetch(`${VITE_API_URL}/create-job`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: jobTitle,
              description: jobDescription,
              location: jobLocation,
              job_type: jobType,
              salary_offer: jobSalary,
              required_experience_years: experienceRequired,
              required_education_level: educationLevel,
              tags: selectedSkills
            })
          });

          const resData = await response.json();

          if (response.ok) {
            Swal.fire({
              title: '¡Éxito!',
              text: 'La búsqueda se creó con éxito.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          } else {
            throw new Error(resData.message || 'Error al crear la búsqueda');
          }
        } catch (error) {
          console.error('Error al crear la búsqueda:', error);
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al crear la búsqueda. Intenta de nuevo.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      }
    });
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
  const handleContactarse = (nombre, esApto) => {
    if (esApto) {
      Swal.fire({
        title: `¿Enviar mail?`,
        text: `¿Querés contactarte con ${nombre}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }).then(result => {
        if (result.isConfirmed) {
          Swal.fire('¡Mail enviado!', `Te has contactado con ${nombre}.`, 'success');
        }
      });
    } else {
      Swal.fire({
        title: `El candidato no es apto`,
        text: `¿Seguro que querés contactarlo igual?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }).then(result => {
        if (result.isConfirmed) {
          Swal.fire('¡Mail enviado!', `Te has contactado con ${nombre}.`, 'success');
        }
      });
    }
  };

  return (
    <div>
      <header className="header">
        <nav className="nav-bar">
          <div className="logo-logged">
            {adminUser?.organization_logo && (
              <img src={`${VITE_API_URL}/${adminUser.organization_logo}`} alt="Logo" height="30" style={{ marginRight: "10px" }} />
            )}
            ✨Aura✨
          </div>
          <div className="admin-info">
            <span>{adminUser?.organization_name}</span>
            <span style={{ marginLeft: '10px' }}>{adminUser?.email}</span>
          </div>
          <button className="logout-button" onClick={handleLogout} title="Cerrar sesión">
            Cerrar Sesión
          </button>
        </nav>
      </header>

      <main>
        <section id="hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Encontrá los perfiles más aptos en segundos.</h1>
              <p>Aura te permite evaluar fácil y rápido cuáles son los mejores candidatos.</p>
            </div>
            <div className="hero-button">
              <button onClick={handleAddCandidateSearch} className="btn-hero" style={{marginRight: '10px'}}>
                Crear nueva búsqueda
              </button>
              <button onClick={() => navigate('/reclutador-solicitudes-supervisor')} className="btn-hero">
                Ver Solicitudes de Supervisor
              </button>
            </div>
          </div>
        </section>


        <div className="search-header">
          <h2>Postulaciones Recibidas</h2>
          <div className="search-actions">
            <div className="search-buttons">
              <button
                onClick={() => setVistaActual('candidatos')}
                className={`vista-btn ${vistaActual === 'candidatos' ? 'active' : ''}`}
              >
                Ver candidatos
              </button>
              <button
                onClick={() => setVistaActual('evaluacion')}
                className={`vista-btn ${vistaActual === 'evaluacion' ? 'active' : ''}`}
              >
                Ver evaluación
              </button>
            </div>

            <div className="filters">
              <div className="filtro-puesto">
                <label>Filtrar por puesto:</label>
                <select
                  className="select-puesto"
                  value={puestoFiltro}
                  onChange={e => setPuestoFiltro(e.target.value)}
                >
                  <option value="">Todos los puestos</option>
                  {puestosUnicos.map((puesto, i) => (
                    <option key={i} value={puesto}>{puesto}</option>
                  ))}
                </select>
              </div>

              <div className="filtro-apto">
                <label>Filtrar por aptitud:</label>
                <select
                  className="select-apto"
                  value={filtroApto}
                  onChange={(e) => setFiltroApto(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Apto">Apto</option>
                  <option value="No Apto">No apto</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {vistaActual === 'candidatos' && (
          <section className="candidatos-section">
            <table className="tabla-candidatos" border="1">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Mail</th>
                  <th>Info</th>
                  <th>CV</th>
                </tr>
              </thead>
              <tbody>
                {candidatos
                  .filter(c => !puestoFiltro || c.puesto === puestoFiltro)
                  .map((c, i) => (
                    <tr key={i}>
                      <td>{c.name} {c.surname}</td>
                      <td>{c.email}</td>
                      <td>
                        <button onClick={() => viewInfo(i)}>Ver Info</button>
                      </td>
                      <td>
                        <button onClick={() => descargarCV(c, { openInNewTab: true })}>Ver CV</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>
        )}

        {vistaActual === 'evaluacion' && (
          <section className="evaluacion-section">
            <table className="tabla-candidatos" border="1">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Años de experiencia</th>
                  <th>Nivel educativo</th>
                  <th>Habilidades</th>
                  <th>Puesto al que se postuló</th>
                  <th>¿Es apto?</th>
                  <th>Contactarse</th>

                </tr>
              </thead>
              <tbody>
                {candidatos
                  .filter(c => {
                    const cumplePuesto = !puestoFiltro || c.job_title === puestoFiltro;
                    const cumpleApto =
                      filtroApto === 'Todos' ||
                      (filtroApto === 'Apto' && c.is_apt === true) ||
                      (filtroApto === 'No Apto' && c.is_apt === false);
                    return cumplePuesto && cumpleApto;
                  })
                  .map((c, i) => (
                    <tr key={i}>
                      <td>{c.name}</td>
                      <td>{c.surname}</td>
                      <td>{c.experience_years}</td>
                      <td>{c.education_level}</td>
                      <td>{Array.isArray(c.keywords) ? c.keywords.join(', ') : c.keywords}</td>

                      <td>{c.job_title}</td>
                      <td className={c.is_apt ? 'apto' : 'no-apto'}>
                        {c.is_apt ? 'Sí' : 'No'}
                      </td>
                      <td>
                        <button onClick={() => handleContactarse(c.name, c.is_apt)}>✉️</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>
        )}

      </main>
    </div>
  );
};

export default ViewReclutador;
