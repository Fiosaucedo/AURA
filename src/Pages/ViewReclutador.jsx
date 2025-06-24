import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './ViewReclutador.css';
import { useNavigate } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';
import Header from '../components/Header.jsx';

const ViewReclutador = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [vistaActual, setVistaActual] = useState('candidatos');
  const [puestoFiltro, setPuestoFiltro] = useState('');
  const [puestosUnicos, setPuestosUnicos] = useState([]);
  const [filtroApto, setFiltroApto] = useState('Todos');
  const [puestos, setPuestos] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [contactados, setContactados] = useState({});
  const [plan, setPlan] = useState();

  const locale = adminUser?.region?.locale || 'es-AR';
  const timezone = adminUser?.region?.timezone || 'UTC';

  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
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

        setPlan(data.plan.id);
        const rol = data.role;

        if (!['recruiter', 'supervisor', 'admin'].includes(rol)) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No tenés permiso para acceder a esta sección.',
          }).then(() => {
            navigate("/login");
          });
        }

        setAdminUser(data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchUser();

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
      } finally {
        setLoading(false);
      }
    };

    fetchCandidatos();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${VITE_API_URL}/job-posts/by-status/approved`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setPuestos)
      .catch(() =>
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar puestos.'
        })
      );
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
  const abrirModal = (descripcion) => {
    Swal.fire({
      title: 'Descripción del puesto',
      html: `<p style="text-align:left">${descripcion}</p>`,
      confirmButtonText: 'Cerrar'
    });
  };

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

  const viewInfo = (index) => {
    const c = candidatos[index];
    Swal.fire({
      title: `${c.name} ${c.surname}`,
      html: `
    <div class="info-candidato">
      <p><strong>Puesto al que se postuló:</strong> ${c.job_title}</p>
      <p><strong>Años de experiencia:</strong> ${c.experience_years}</p>
      <p><strong>Nivel educativo:</strong> ${c.education_level}</p>
      <p><strong>Habilidades:</strong> ${c.keywords}</p>
      <p><strong>Teléfono:</strong> ${c.phone}</p>
    </div>
  `,
      confirmButtonText: 'Cerrar',
      customClass: {
        htmlContainer: 'popup-info-container'
      }
    });
  };

  const handleEnviarMail = async (index, nombre, esApto, idCandidato, jobTitle) => {
    const mensaje = esApto
      ? `¿Querés contactarte con ${nombre}?`
      : `¿Seguro que querés contactarte con ${nombre} si no es apto?`;

    const confirmacion = await Swal.fire({
      title: '¿Enviar mail?',
      text: mensaje,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${VITE_API_URL}/contact-candidate/${idCandidato}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job_title: jobTitle })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('¡Mail enviado!', `Te has contactado con ${nombre}.`, 'success');
        setContactados(prev => ({
          ...prev,
          [index]: { contactado: true, contratado: null, fijo: false }
        }));
      } else {
        Swal.fire('Error', data.message || 'No se pudo enviar el correo.', 'error');
      }
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      Swal.fire('Error', 'Hubo un problema al contactar al candidato.', 'error');
    }
  };

  const marcarContratado = (index) => {
    Swal.fire({
      title: '¿Marcar este postulante como contratado?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) {
        setContactados(prev => ({
          ...prev,
          [index]: { ...prev[index], contratado: true, fijo: true }
        }));
        Swal.fire('¡Postulante marcado como contratado!', '', 'success');
      }
    });
  };

  return (
    <div>
      <Header adminUser={adminUser} onLogout={handleLogout} VITE_API_URL={VITE_API_URL} />

      <main>
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
              <button
                onClick={() => setVistaActual('postulaciones')}
                className={`vista-btn ${vistaActual === 'postulaciones' ? 'active' : ''}`}
              >
                Postulaciones abiertas
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
        {vistaActual === 'evaluacion' && (
          <section className="evaluacion-section">
            {loading ? (
              <div className="loading-spinner">
                <span className="loader"></span>
              </div>
            ) : candidatos.length === 0 ? (
              <p className="mensaje-vacio">Aún no recibiste postulaciones :(</p>
            ) : (
              <>
                {candidatos.filter(c => {
                  const cumplePuesto = !puestoFiltro || c.job_title === puestoFiltro;
                  const cumpleApto =
                    filtroApto === 'Todos' ||
                    (filtroApto === 'Apto' && c.is_apt === true) ||
                    (filtroApto === 'No Apto' && c.is_apt === false);
                  return cumplePuesto && cumpleApto;
                }).length === 0 ? (
                  <p className="mensaje-vacio">Ningún candidato coincide con tu búsqueda :(</p>
                ) : (
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
                        <th>Score de aptitud</th>
                        <th>Estado</th>
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
                        .map((c, i) => {
                          const yaContactado = c.contacted;
                          return (
                            <tr key={i}>
                              <td>{c.name}</td>
                              <td>{c.surname}</td>
                              <td>{c.experience_years}</td>
                              <td>{c.education_level}</td>
                              <td>{Array.isArray(c.keywords) ? c.keywords.join(', ') : c.keywords}</td>
                              <td>{c.job_title}</td>
                              <td className={c.is_apt ? 'apto' : 'no-apto'}>{c.is_apt ? 'Sí' : 'No'}</td>
                              <td>
                                {plan === 2
                                  ? (c.apt_score != null ? `${Number(c.apt_score).toFixed(2)}%` : 'N/A')
                                  : 'Solo con suscripción Pro'}
                              </td>
                              <td>
                                {!yaContactado ? (
                                  <button className='contactarse-button' onClick={() => handleEnviarMail(i, c.name, c.is_apt, c.candidate_id, c.job_title)}>✉️ Contactarse</button>
                                ) : c.contacted ? (
                                  <span style={{ color: 'green', fontWeight: 'bold' }}>Contactado</span>
                                ) : (
                                  <button className='marcar-contratado-button' onClick={() => marcarContratado(i)}>Marcar contratado</button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </section>
        )}

        {vistaActual === 'candidatos' && (
          <section className="candidatos-section">
            {loading ? (
              <div className="loading-spinner">
                <span className="loader"></span>
              </div>
            ) : candidatos.length === 0 ? (
              <p className="mensaje-vacio">aún no recibiste postulaciones :(</p>
            ) : (
              <>
                {candidatos.filter(c => !puestoFiltro || c.job_title === puestoFiltro).length === 0 ? (
                  <p className="mensaje-vacio">ningún candidato coincide con tu búsqueda</p>
                ) : (
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
                        .filter(c => !puestoFiltro || c.job_title === puestoFiltro)
                        .map((c, i) => (
                          <tr key={i}>
                            <td>{c.name} {c.surname}</td>
                            <td>{c.email}</td>
                            <td><button onClick={() => viewInfo(i)} className="icon-button" title="Ver Información">
                              <FileText size={20} /></button></td>
                            <td><button onClick={() => descargarCV(c, { openInNewTab: true })} className="icon-button" title="Ver CV">
                              <Download size={20} />
                            </button></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </section>
        )}

        {vistaActual === 'postulaciones' && (
          <section className="postulaciones-section">
            <table className="tabla-puestos" border="1">
              <thead>
                <tr>
                  <th>Título del puesto</th>
                  <th>Descripción</th>
                  <th>Fecha de creación</th>
                  <th>Cantidad de postulantes</th>
                  <th>Cantidad de aptos</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {puestos.map((p, i) => (
                  <tr key={i}>
                    <td>{p.title}</td>
                    <td className="info-cell">
                      <button className="info-button" onClick={() => abrirModal(p.description)}>i</button>
                    </td>
                    <td>
                      {new Intl.DateTimeFormat(adminUser?.region?.locale || 'es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: adminUser?.region?.timezone || 'UTC'
                      }).format(new Date(p.created_at))}
                    </td>                    
                    <td>{p.candidates}</td>
                    <td>{p.apt_candidates}</td>
                    <td className={p.is_active ? 'active' : 'hide'}>
                      {p.is_active ? 'En curso' : 'Deshabilitada'}
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
