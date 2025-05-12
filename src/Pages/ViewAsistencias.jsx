import React, { useState } from 'react';
import DashboardAsistencia from './DashboardAsistencia';
import CalendarioAsistencia from './CalendarioAsistencia';
import './ViewAsistencias.css';

const Asistencia = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminUser, setAdminUser] = useState(null);

  const handleLogout = () => {
    import('sweetalert2').then(Swal => {
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
    });
  };

  return (
    <div className="asistencia-container">
      <header className="header">
        <nav className="nav-bar">
          <div className="logo-logged">
            {adminUser?.organization_logo && (
              <img src={`https://aura-back-3h9b.onrender.com/${adminUser.organization_logo}`} alt="Logo" height="30" style={{ marginRight: "10px" }} />
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


      <div className="controls-container">
        <div className="controls">
          <h1>Panel de Supervisión de Asistencia</h1>

          <div className="tabs">

            <button
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={activeTab === 'calendario' ? 'active' : ''}
              onClick={() => setActiveTab('calendario')}
            >
              Calendario
            </button>
          </div>
        </div>
        {activeTab === 'dashboard' && (
          <div className="dashboard-filters">
            <DashboardAsistencia />
          </div>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'calendario' && <CalendarioAsistencia />}
      </div>

    </div>
  );
};

export default Asistencia;
