import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './ViewReclutador.css';

const ViewReclutador = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [vistaActual, setVistaActual] = useState('candidatos');
  const [puestoFiltro, setPuestoFiltro] = useState('');
  const [puestosUnicos, setPuestosUnicos] = useState([]);
  const [filtroApto, setFiltroApto] = useState('Todos');
  const skillsList = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Teamwork', 'Leadership', 'English'];

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
    const url = `http://127.0.0.1:5000/${filename}`;
  
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
    const fetchCandidatos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:5000/candidatos", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al cargar los candidatos');
        const data = await response.json();
        const candidatosConApto = data.map(c => ({ ...c, esApto: Math.random() > 0.5 }));
        setCandidatos(candidatosConApto);
        const puestos = [...new Set(data.map(c => c.puesto || "Sin puesto"))];
        setPuestosUnicos(puestos);
      } catch (error) {
        console.error('Error cargando candidatos:', error);
      }
    };
    fetchCandidatos();
  }, []);

  const viewInfo = (index) => {
    const c = candidatos[index];
    Swal.fire({
      title: `${c.nombre} ${c.apellido}`,
      html: `
        <p><strong>Edad:</strong> ${c.edad}</p>
        <p><strong>Años de experiencia:</strong> ${c.experiencia}</p>
        <p><strong>Nivel educativo:</strong> ${c.nivel_educativo}</p>
        <p><strong>Inglés:</strong> ${c.ingles}</p>
        <p><strong>Disponibilidad:</strong> ${c.disponibilidad}</p>
        <p><strong>Pretensión salarial:</strong> ${c.salario}</p>
        <p><strong>Último empleo (meses):</strong> ${c.empleo_anterior}</p>
        <p><strong>Habilidades:</strong> ${c.habilidades}</p>
        <p><strong>Conocimientos adicionales:</strong> ${c.adicionales}</p>
        <p><strong>Certificaciones:</strong> ${c.certificaciones}</p>
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
  
        <div style="display: flex; gap: 10px; justify-content: space-between; margin-top: 20px">
          <div id="skills-list" class="skills-container">
            ${skillsList.map(skill => `  
              <span class="skill-tag" data-skill="${skill}">${skill}</span>
            `).join('')}
          </div>
          <div id="selected-skills" class="selected-skills-container">
            <p id="no-skills" style="color:#888;">Seleccioná habilidades</p>
          </div>
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
        const skillsListContainer = Swal.getPopup().querySelector('#skills-list');
        const selectedSkillsContainer = Swal.getPopup().querySelector('#selected-skills');
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
  
          const response = await fetch('http://127.0.0.1:5000/create-job', {
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
        console.log('Sesión cerrada');
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
          <div className="logo-logged">✨Aura✨</div>
          <button className="logout-button" id="logout-button" onClick={handleLogout} title="Cerrar sesión">
            Cerrar Sesion
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
              <button onClick={handleAddCandidateSearch} className="btn-hero">
                Crear nueva búsqueda
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
                  <th>Edad</th>
                  <th>Años de experiencia</th>
                  <th>Nivel educativo</th>
                  <th>Nivel de inglés</th>
                  <th>Disponibilidad</th>
                  <th>Pretensión salarial</th>
                  <th>Último empleo (meses)</th>
                  <th>Habilidades</th>
                  <th>Conocimientos adicionales</th>
                  <th>Certificaciones</th>
                  <th>Contactarse</th>
                  <th>¿Es apto?</th>

                </tr>
              </thead>
              <tbody>
                {candidatos
                  .filter(c => {
                    const cumplePuesto = !puestoFiltro || c.puesto === puestoFiltro;
                    const cumpleApto = filtroApto === 'Todos' ||
                      (filtroApto === 'Apto' && c.esApto === true) ||
                      (filtroApto === 'No Apto' && c.esApto === false);
                    return cumplePuesto && cumpleApto;
                  })
                  .map((c, i) => (
                    <tr key={i}>
                      <td>{c.name}</td>
                      <td>{c.edad}</td>
                      <td>{c.experiencia}</td>
                      <td>{c.nivel_educativo}</td>
                      <td>{c.ingles}</td>
                      <td>{c.disponibilidad}</td>
                      <td>{c.salario}</td>
                      <td>{c.empleo_anterior}</td>
                      <td>{c.habilidades}</td>
                      <td>{c.adicionales}</td>
                      <td>{c.certificaciones}</td>
                      <td>
                        <button onClick={() => handleContactarse(c.nombre, c.esApto)}>✉️</button>
                      </td>
                      <td className={c.esApto ? 'apto' : 'no-apto'}>
                        {c.esApto ? 'Sí' : 'No'}
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
