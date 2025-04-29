import React, { useState, useEffect } from 'react';
import './Home.css';
import globantLogo from '../../img/logo-globant.png';
import accentureLogo from '../../img/logo-accenture.png';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [puestos, setPuestos] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [selectedPuesto, setSelectedPuesto] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://aura-back-3h9b.onrender.com/job-posts')
      .then(response => response.json())
      .then(data => {
        console.log('Jobs cargados:', data);
        setPuestos(data);
      })
      .catch((error) => console.error('Error al cargar los jobs:', error));
  }, []);

  const handleCardClick = (puesto) => {
    Swal.fire({
      title: puesto.title,
      html: `<div style="white-space: pre-line; line-height: 1.6;">${puesto.description}</div>`,
      showCancelButton: true,
      confirmButtonText: 'Ir a postulación',
      cancelButtonText: 'Descargar template para CV',
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/vista-postulante', { state: { jobPostId: puesto.id } });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        const link = document.createElement('a');
        link.href = '/plantilla-cv.docx';
        link.download = 'plantilla-cv.docx';
        link.click();
      }
    });
  };

  const filteredPuestos = puestos.filter((p) => {
    return (
      (selectedEmpresa === '' || p.empresa === selectedEmpresa) &&
      (selectedPuesto === '' || p.puesto === selectedPuesto)
    );
  });

  const puestosUnicos = [...new Set(puestos.map((item) => item.puesto))];

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="logo">✨Aura✨</h1>
        <a href="/login" className="mi-aura">mi Aura</a>
      </header>

      <div className="home-banner">
        <h2>¡Encontrá el trabajo de tus sueños!</h2>

        <div className="filters">
          <select value={selectedEmpresa} onChange={(e) => setSelectedEmpresa(e.target.value)}>
            <option value="">Filtrar por empresa</option>
            <option value="Accenture">Accenture</option>
            <option value="Globant">Globant</option>
          </select>

          <select value={selectedPuesto} onChange={(e) => setSelectedPuesto(e.target.value)}>
            <option value="">Filtrar por puesto</option>
            {puestosUnicos.map((puesto, index) => (
              <option key={index} value={puesto}>{puesto}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="cards-container">
        {filteredPuestos.map((item, index) => (
          <div key={index} className="job-card" onClick={() => handleCardClick(item)}>
            <div className="job-logo">
              {item.organization.logo_url ? (
                <img src={item.organization.logo_url} alt="Logo Empresa" width="50" height="50" />
              ) : (
                '[Logo]'
              )}
            </div>
            <div className="job-title">{item.title}</div>
            <div className="job-company">{item.organization.name}</div>
          </div>
        ))}
      </div>

      <footer className="home-footer">
        <p>© 2025 Aura - Juan María Gutierrez 1150</p>
      </footer>
    </div>
  );
}

export default Home;