import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './ViewReclutador.css';

const ViewReclutador = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [evaluadosHTML, setEvaluadosHTML] = useState('');

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

  const evaluarCandidatos = () => {
    const html = (
      <table border="1">
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
              <td>{Math.random() > 0.5 ? 'Sí' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    setEvaluadosHTML(html);
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
          <p>Aptin te permite evaluar fácil y rápido cuáles son los mejores candidatos.</p>
          <button id="evaluate-btn" onClick={evaluarCandidatos}>Evaluar candidatos</button>
        </section>

        
        <div id="evaluated-table-container" style={{ marginTop: '40px' }}>
          {evaluadosHTML}
        </div>
      </main>
    </div>
  );
};

export default ViewReclutador;
