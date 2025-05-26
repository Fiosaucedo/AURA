import React, { useState, useEffect } from 'react';
import DashboardAsistencia from './DashboardAsistencia';
import Swal from 'sweetalert2';
import CalendarioAsistencia from './CalendarioAsistencia';
import './ViewAsistencias.css';
import { useNavigate } from 'react-router-dom';
import SueldoEmpleados from './SueldoEmpleados';



const Asistencia = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminUser, setAdminUser] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!['admin', 'supervisor', 'receptionist'].includes(data.role)) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No tenés permiso para acceder a esta sección.',
            confirmButtonText: 'Ir al login'
          }).then(() => {
            navigate("/login");
          });
          return;
        }
        setAdminUser(data);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error de autenticación. Redirigiendo al login.'
        }).then(() => {
          navigate("/login");
        });
      }
    };

    fetchUser();
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


  return (
    <div className="asistencia-container">
      <header className="header">
        <nav className="nav-bar">
          <div className="logo-logged">
            {adminUser?.organization_logo && (
              <img src={`${API_URL}/${adminUser.organization_logo}`} alt="Logo" height="30" style={{ marginRight: "10px" }} />
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
            <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
              Dashboard
            </button>
            <button className={activeTab === 'calendario' ? 'active' : ''} onClick={() => setActiveTab('calendario')}>
              Calendario
            </button>
            <button className={activeTab === 'sueldos' ? 'active' : ''} onClick={() => setActiveTab('sueldos')}>
              Sueldos
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
        {activeTab === 'sueldos' && <SueldoEmpleados />}
      </div>
    </div>
  );
};

export default Asistencia;
