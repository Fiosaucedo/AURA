import React, { useState, useEffect } from 'react';
import './Home.css';
import globantLogo from '../../img/logo-globant.png';
import accentureLogo from '../../img/logo-accenture.png';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function Home() {
  const [puestos, setPuestos] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [selectedPuesto, setSelectedPuesto] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const navigate = useNavigate();
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${VITE_API_URL}/active-job-posts`)
      .then(response => response.json())
      .then(data => {
        console.log('Jobs cargados:', data);
        setPuestos(data);
      })
      .catch((error) => console.error('Error al cargar los jobs:', error));
  }, []);

  const handleCardClick = (puesto) => {
    console.log(puesto)
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
      (selectedEmpresa === '' || p.organization.name === selectedEmpresa) &&
      (selectedPuesto === '' || p.title === selectedPuesto)&&
      (selectedLocation === '' || p.location === selectedLocation)
    );
  });

  const puestosUnicos = [...new Set(puestos.map((item) => item.title))];


  return (
    <div className="home-container">
      <header className="home-header">
        <Header />
      </header>

      <div className="home-banner">
        <h2>¡Encontrá el trabajo de tus sueños!</h2>

        <div className="filters">
        <select value={selectedEmpresa} onChange={(e) => setSelectedEmpresa(e.target.value)}>
          <option value="">Filtrar por empresa</option>
          {[...new Set(puestos.map(p => p.organization.name))].map((empresa, index) => (
            <option key={index} value={empresa}>{empresa}</option>
          ))}
        </select>

          <select value={selectedPuesto} onChange={(e) => setSelectedPuesto(e.target.value)}>
            <option value="">Filtrar por puesto</option>
            {puestosUnicos.map((puesto, index) => (
              <option key={index} value={puesto}>{puesto}</option>
            ))}
          </select>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
            <option value="">Filtrar por Ubicacion</option>
            {[...new Set(puestos.map(p => p.location))].map((location, index) => (
            <option key={index} value={location}>{location}</option>
            ))}
          </select>

        </div>
      </div>

      <div className="cards-container">
        {filteredPuestos.map((item, index) => (
          <div key={index} className="job-card" onClick={() => handleCardClick(item)}>
            <div className="job-logo">
              {item.organization.logo_path ? (
                <img src={`${VITE_API_URL}${item.organization.logo_path}`} alt="Logo Empresa" width="50" height="50" />
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