import React, { useEffect, useRef } from 'react';
import Header from '../components/Header'; // Ruta ajustada
import { Link } from 'react-router-dom';
import './Services.css';
import PlanComparisonTable from './PlanComparisonTable'; // Ruta ajustada
import './PlanComparisonTable.css'; // Ruta ajustada

const Services = () => {
  const introRef = useRef(null);
  const serviceCardsRef = useRef([]);
  const ctaRef = useRef(null);

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    };

    const observerOptions = { threshold: 0.2 };
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (introRef.current) observer.observe(introRef.current);
    serviceCardsRef.current.forEach((card) => card && observer.observe(card));
    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => {
      if (introRef.current) observer.unobserve(introRef.current);
      serviceCardsRef.current.forEach((card) => card && observer.unobserve(card));
      if (ctaRef.current) observer.unobserve(ctaRef.current);
    };
  }, []);

  return (
    <>
      <Header />
      <div className="services-container">
        <section ref={introRef} className="services-intro fade-in-up-element">
          <h1>Soluciones innovadoras para tu gestión de talento</h1>
          <p>
            En Aura, simplificamos la forma en que gestionas tu capital humano, desde la búsqueda y selección hasta la administración diaria y el análisis de datos. Descubre nuestras herramientas diseñadas para potenciar tu equipo.
          </p>
          <Link to="/contactanos" className="primary-button">
            ¡Hablemos de tus necesidades!
          </Link>
        </section>

        {/* Aquí se inserta el componente de la tabla comparativa de planes */}
        <PlanComparisonTable />

        <section className="services-section">
          <div
            ref={(el) => (serviceCardsRef.current[0] = el)}
            className="service-card fade-in-up-element service-card-selection"
          >
            <h2>Selección Inteligente de Candidatos</h2>
            <div className="service-description">
              <p>
                Nuestro sistema automatiza la lectura y clasificación de CVs, utilizando criterios avanzados para encontrar a los candidatos más adecuados.
              </p>
            </div>
          </div>

          <div
            ref={(el) => (serviceCardsRef.current[1] = el)}
            className="service-card fade-in-up-element service-card-attendance"
          >
            <h2>Control de Asistencia</h2>
            <div className="service-description">
              <p>
                Gestiona la asistencia del personal con registros automáticos, reportes personalizados y alertas en tiempo real.
              </p>
            </div>
          </div>

          <div
            ref={(el) => (serviceCardsRef.current[2] = el)}
            className="service-card fade-in-up-element service-card-job-post"
          >
            <h2>Publicación de Búsquedas Laborales</h2>
            <div className="service-description">
              <p>
                Publica oportunidades de empleo en nuestra plataforma y realiza un seguimiento del rendimiento de cada publicación.
              </p>
            </div>
          </div>

          <div
            ref={(el) => (serviceCardsRef.current[3] = el)}
            className="service-card fade-in-up-element service-card-reports"
          >
            <h2>Reportes Personalizados</h2>
            <div className="service-description">
              <p>
                Genera informes detallados y visualizaciones interactivas para tomar decisiones basadas en datos precisos.
              </p>
            </div>
          </div>
        </section>

        <section ref={ctaRef} className="services-cta fade-in-up-element">
          <h2>¿Listo para transformar tu gestión de RRHH?</h2>
          <p>
            Contacta a nuestro equipo para una demostración personalizada y descubre cómo Aura puede adaptarse a las necesidades específicas de tu empresa.
          </p>
          <Link to="/contactanos" className="secondary-button">
            Solicita una Demostración
          </Link>
        </section>
      </div>
    </>
  );
};

export default Services;
