import React from 'react';
import './PlanComparisonTable.css'; 

const PlanComparisonTable = () => {

  const planFeatures = [
   
    {
      feature: "Ideal Para",
      auraStart: "Pymes o equipos chicos que buscan digitalizar su proceso de selección y gestión de RRHH.",
      auraPro: "Empresas que necesitan control integral del personal, herramientas inteligentes de evaluación y procesos centralizados."
    },
    {
      feature: "Cantidad de Usuarios",
      auraStart: "Hasta 15*",
      auraPro: "Hasta 60*"
    },
    {
      feature: "Carga y Almacenamiento de CVs",
      auraStart: "Hasta 300 CVs al mes",
      auraPro: "Ilimitados"
    },
    {
      feature: "Gestión de Candidatos",
      auraStart: "Reclutamiento, agenda de entrevistas, evaluaciones básicas",
      auraPro: "Integral (incluye las funcionalidades del plan Esencial)"
    },
    {
      feature: "Lectura Automática de CVs con IA",
      auraStart: "Clasificación por APTO / NO APTO",
      auraPro: "Análisis automático con IA, Sistema de Ranking con puntajes para cada candidato"
        
      
    },
    {
      feature: "Panel de Seguimiento / Dashboard",
      auraStart: "Básico de procesos",
      auraPro: "Dashboard Analítico Avanzado (visualización por áreas, Indicadores clave de desempeño, contrataciones, ausentismo y eficiencia de selección)."
    },
    {
      feature: "Reportes",
      auraStart: "Predefinidos, en PDF",
      auraPro: "Personalizados, en PDF o Excel"
    },
    {
      feature: "Soporte",
      auraStart: "Via Mail",
      auraPro: "Via Mail + Capacitación inicial + seguimiento mensual (opcional)."
    },
    {
      feature: "Acceso",
      auraStart: "Web",
      auraPro: "Web y Mobile"
    },
    {
      feature: "Registro de asistencia con Reconocimiento Facial",
      auraStart: "No incluido",
      auraPro: "Sí"
    },
    {
      feature: "Gestion de Licencias y Cerificados Médicos",
      auraStart: "No incluido",
      auraPro: "Sí"
    },

     {
      feature: "Calculo de Sueldos",
      auraStart: "No incluido",
      auraPro: "Sí"
    },


    {
      feature: "Precio p/mes",
      auraStart: "Desde ARS $80.000",
      auraPro: "Desde ARS $120.000"
    },
   
  ];

  return (
    <div className="plan-comparison-container">
      <h2 className="plan-comparison-title">
        Planes de Suscripción para Empresas
      </h2>

      <div className="plan-comparison-table-wrapper">
        <table className="plan-comparison-table">
       
          <thead className="plan-comparison-thead">
            <tr>
              <th className="plan-comparison-th plan-comparison-th-tl">
                Plan
              </th>
              <th className="plan-comparison-th">
                <span className="text-xs font-normal">AURA Start</span>
              </th>
              <th className="plan-comparison-th plan-comparison-th-tr">
               <span className="text-xs font-normal">AURA Pro</span>
              </th>
            </tr>
          </thead>
    
          <tbody className="plan-comparison-tbody">
            {planFeatures.map((row, index) => (
              <tr key={index} className={`plan-comparison-tr ${row.feature === 'Precio p/mes' ? 'plan-comparison-price-row' : ''}`}>
                <td className={`plan-comparison-td plan-comparison-td-feature ${index === planFeatures.length - 1 ? 'plan-comparison-td-bl' : ''}`}>
                  {row.feature}
                </td>
                <td className="plan-comparison-td plan-comparison-td-plan">
                  {row.auraStart}
                </td>
                <td className={`plan-comparison-td plan-comparison-td-plan ${index === planFeatures.length - 1 ? 'plan-comparison-td-br' : ''}`}>
                  {row.auraPro}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanComparisonTable;
