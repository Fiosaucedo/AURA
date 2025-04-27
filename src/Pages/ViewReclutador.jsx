import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './ViewReclutador.css';

const ViewReclutador = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [vistaActual, setVistaActual] = useState('candidatos');
  const skillsList = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Teamwork', 'Leadership', 'English'];
  const [puestoFiltro, setPuestoFiltro] = useState('');
  const [puestosUnicos, setPuestosUnicos] = useState([]);
  const [filtroApto, setFiltroApto] = useState('Todos');

  useEffect(() => {
    fetch('/candidatos.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar el archivo candidatos.json');
        }
        return response.json();
      })
      .then(data => {
        const candidatosConApto = data.map(c => ({
          ...c,
          esApto: Math.random() > 0.5
        }));
        setCandidatos(candidatosConApto);
        const puestos = [...new Set(data.map(c => c.puesto))];
        setPuestosUnicos(puestos);
      })
      .catch(error => {
        console.error('Error cargando candidatos:', error);
      });
  }, []);

  const viewInfo = (index) => {
    const candidato = candidatos[index];
    Swal.fire({
      title: `${candidato.nombre} ${candidato.apellido}`,
      html: `
        <p><strong>Edad:</strong> ${candidato.edad}</p>
        <p><strong>Años de experiencia:</strong> ${candidato.experiencia}</p>
        <p><strong>Nivel educativo:</strong> ${candidato.nivel_educativo}</p>
        <p><strong>Inglés:</strong> ${candidato.ingles}</p>
        <p><strong>Disponibilidad:</strong> ${candidato.disponibilidad}</p>
        <p><strong>Pretensión salarial:</strong> ${candidato.salario}</p>
        <p><strong>Último empleo (meses):</strong> ${candidato.empleo_anterior}</p>
        <p><strong>Habilidades:</strong> ${candidato.habilidades}</p>
        <p><strong>Conocimientos adicionales:</strong> ${candidato.adicionales}</p>
        <p><strong>Certificaciones:</strong> ${candidato.certificaciones}</p>
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
      width: '900px',
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
          if (selectedSkills.length === 0) {
            noSkillsText.style.display = 'block';
          } else {
            noSkillsText.style.display = 'none';
          }
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
          selectedSkills
        };
      }
    }).then(result => {
      if (result.isConfirmed) {
        console.log('Nueva búsqueda creada:', result.value);
        Swal.fire({
          title: '¡Éxito!',
          text: 'La búsqueda se ha creado con éxito.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Estás seguro de que deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Sesión cerrada');
      }
    });
  };

  const handleContactarse = (nombre, esApto) => {

    if (esApto) {
      Swal.fire({
        title: `¿Enviar mail?`,
        text: `¿Estás seguro que querés contactarte con ${nombre}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar mail',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          console.log(`Enviando mail a ${nombre}`);
  
          Swal.fire({
            title: '¡Mail enviado!',
            text: `Te has contactado con ${nombre}.`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
        }
      });
    } else {

      Swal.fire({
        title: `¿Estás seguro que querés contactarte con ${nombre}?`,
        text: ` El candidato al que estás por enviar un correo no es apto para esta búsqueda. ¿Quieres contactarte de todos modos?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, contactar de todos modos',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          console.log(`Enviando mail a ${nombre}`);
          Swal.fire({
            title: '¡Mail enviado!',
            text: `Te has contactado con ${nombre}.`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
        }
      });
    }
  };

  return (
    <div>
      <header className="header">
        <nav className="nav-bar">
          <div className="logo">✨Aura✨</div>
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
                      <td>{c.nombre} {c.apellido}</td>
                      <td>{c.mail}</td>
                      <td>
                        <button onClick={() => viewInfo(i)}>Ver Info</button>
                      </td>
                      <td>
                        <button>Descargar CV</button>
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
                      <td>{c.nombre}</td>
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
