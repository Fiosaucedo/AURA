import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './ViewReclutador.css';

const ViewReclutador = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [vistaActual, setVistaActual] = useState('candidatos');

  useEffect(() => {
    fetch('/candidatos.json')
      .then(res => res.json())
      .then(data => setCandidatos(data));
  }, []);

  const verInfo = (index) => {
    const c = candidatos[index];
    Swal.fire({
      title: `${c.nombre} ${c.apellido}`,
      html: `
        <p><strong>Mail:</strong> ${c.mail}</p>
        <p><strong>Teléfono:</strong> ${c.telefono}</p>
        <p><strong>Nacionalidad:</strong> ${c.nacionalidad}</p>
        <p><strong>Localidad:</strong> ${c.localidad}</p>
      `,
      icon: 'info',
    });
  };

  return (
    <div>
      <header>
        <nav>
          <div className="logo">Aura</div>
        </nav>
      </header>

      <main>
        <section id="hero">
          <h1>Encontrá los perfiles más aptos en segundos.</h1>
          <p>Aura te permite evaluar fácil y rápido cuáles son los mejores candidatos.</p>
          <div className="hero-buttons">
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
        </section>

        {vistaActual === 'candidatos' && (
          <section className="candidatos-section">
            <h2>Candidatos que enviaron su CV</h2>
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
                {candidatos.map((c, i) => (
                  <tr key={i}>
                    <td>{c.nombre} {c.apellido}</td>
                    <td>{c.mail}</td>
                    <td><button onClick={() => verInfo(i)}>Ver Info</button></td>
                    <td><button>Descargar CV</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {vistaActual === 'evaluacion' && (
          <div className="evaluacion-section">
            <h2>Evaluación de Candidatos</h2>
            <table className="tabla-candidatos" border="1">
              <thead>
                <tr>
                  <th>Nombre</th><th>Apellido</th><th>Edad</th><th>Años de experiencia</th>
                  <th>Nivel educativo</th><th>Nivel de inglés</th><th>Disponibilidad</th>
                  <th>Pretensión salarial</th><th>Último empleo (meses)</th>
                  <th>Habilidades</th><th>Conocimientos adicionales</th>
                  <th>Certificaciones</th><th>¿Es Apto?</th>
                </tr>
              </thead>
              <tbody>
                {candidatos.map((c, i) => (
                  <tr key={i}>
                    <td>{c.nombre}</td>
                    <td>{c.apellido}</td>
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
                    {(() => {
                      const esApto = Math.random() > 0.5;
                      return (
                        <td className={esApto ? 'apto' : 'no-apto'}>
                          {esApto ? 'Sí' : 'No'}
                        </td>
                      );
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewReclutador;
