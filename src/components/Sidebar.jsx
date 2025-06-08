import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { FaHome, FaUsers, FaClipboardList, FaClock, FaSignOutAlt,FaSearch, FaBuilding, } from 'react-icons/fa';
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

  

  const menuItems = {
    admin: [
      { path: '/vista-admin', label: 'Empleados', icon: <FaUsers size={20} /> },
      { path: '/create-organization', label: 'Crear Empresa', icon: <FaBuilding size={20} /> },
    ],
    supervisor: [
      { path: '/vista-supervisor', label: 'Home', icon: <FaHome size={20} />  },
      { path: '/asistencias', label: 'Asistencias', icon: <FaClock size={20}/> },
    ],
    
    recruiter: [
      { path: '/vista-reclutador', label: 'Candidatos', icon: <FaSearch size={20}/> },
      { path: '/reclutador-solicitudes-supervisor', label: 'Solicitudes de Busqueda', icon: <FilePlus size={20}/> },
    
    ],
    recepcionista: [
      { path: '/vista-recepcionista', label: 'Recepcionista', icon: '📠' },
    ]
  };

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
        {(menuItems[user.role] || []).map((item, index) => (
          <li key={index}>
            <Link to={item.path} className="sidebar-link">
              <span className="icon">{item.icon}</span>
              {isHovered && <span className="label">{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
