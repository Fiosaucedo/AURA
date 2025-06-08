
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { LogOut } from 'lucide-react';

const Header = ({ adminUser, VITE_API_URL, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="header">
      <nav className="nav-bar">
     
        <div className="logo-section">
          <Link to="/" className="main-logo">
            ✨Aura✨
          </Link>
          {adminUser?.organization_logo && (
            <img src={`https://aura-back-3h9b.onrender.com/${adminUser.organization_logo}`} alt="Logo" height="30" style={{ marginRight: "10px" }} />
          )}
        </div>

        
        {!adminUser && ( 
          <div className="landing-nav-buttons">
            <Link to="/contactanos" className="nav-button">Contáctanos</Link>
            <Link to="/servicios" className="nav-button">Servicios</Link>
            <Link to="/nuestra-mision" className="nav-button">Nuestra Misión</Link> 
          </div>
        )}

 
        {adminUser ? (
          <div className="user-actions-logged">
            <div className="admin-info">
              <span>{adminUser.organization_name}</span>
              <span className="admin-email">{adminUser.email}</span>
            </div>
            <button className="logout-button" onClick={handleLogout} title="Cerrar Sesión"> 
            <LogOut size={20} /> 
          </button>
          </div>
        ) : (
          <Link to="/login" className="mi-aura-button">
            mi Aura
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;