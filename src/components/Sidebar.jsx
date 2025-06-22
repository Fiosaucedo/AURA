import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';
// Importa FaCog junto con los otros íconos
import { FaUsers, FaClipboardList, FaClock, FaSignOutAlt, FaSearch, FaBuilding, FaComment, FaBriefcase, FaFile, FaCog } from 'react-icons/fa';
import { FilePlus } from 'lucide-react';


const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const validateUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data && data.role) {
          setUser(data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error al validar usuario en Sidebar', err);
      } finally {
        setIsLoading(false);
      }
    };

    validateUser();
  }, []);

  if (isLoading || !isAuthenticated) return null;

  const commonAdminMenuItems = [
    { path: '/vista-admin', label: 'Empleados', icon: <FaUsers size={20} /> }
  ];

  const superAdminMenuItems = [
    { path: '/create-organization', label: 'Crear Empresa', icon: <FaBuilding size={20} /> },
    { path: '/mensajeria-superadmin', label: 'Mensajeria', icon: <FaComment size={20} /> }
  ];

  const supervisorMenuItems = [
    { path: '/vista-supervisor', label: 'Postulaciones', icon: <FaBriefcase size={20} /> },
    { path: '/asistencias', label: 'Asistencias', icon: <FaClock size={20} /> },
    { path: '/certificados', label: 'Certificados', icon: <FaFile size={20} /> },
  ];

  const recruiterMenuItems = [
    { path: '/vista-reclutador', label: 'Candidatos', icon: <FaSearch size={20} /> },
    { path: '/reclutador-solicitudes-supervisor', label: 'Solicitudes de Busqueda', icon: <FilePlus size={20} /> },
  ];

  const recepcionistaMenuItems = [
    { path: '/vista-recepcionista', label: 'Recepcionista', icon: '📠' },
  ];

  let currentMenuItems = [];
  if (user.role === 'admin') {
    if (user.is_superadmin) {
      currentMenuItems = superAdminMenuItems;
    } else {
      currentMenuItems = commonAdminMenuItems;
    }
  } else if (user.role === 'supervisor') {
    currentMenuItems = supervisorMenuItems;
  } else if (user.role === 'recruiter') {
    currentMenuItems = recruiterMenuItems;
  } else if (user.role === 'recepcionista') {
    currentMenuItems = recepcionistaMenuItems;
  }

  return (
    <div
      className={`sidebar ${isHovered ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="sidebar-title">
        {isHovered && `Rol: ${user.role}`}
      </div>
      <ul className="sidebar-list">
        {(currentMenuItems || []).map((item, index) => (
          <li key={index}>
            <Link to={item.path} className="sidebar-link">
              <span className="icon">{item.icon}</span>
              {isHovered && <span className="label">{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
      
      <div className="sidebar-bottom-actions">
        <li>
          <Link to="/perfil" className="sidebar-link">
            <span className="icon"><FaCog size={20} /></span>
            {isHovered && <span className="label">Mi Perfil</span>}
          </Link>
        </li>
      </div>
    </div>
  );
};

export default Sidebar;