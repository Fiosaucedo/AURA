import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { LogOut } from 'lucide-react';

const Header = ({ adminUser, VITE_API_URL, onLogout }) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleMouseEnter = () => {
    setShowPopup(true);
  };

  const handleMouseLeave = () => {
    setShowPopup(false);
  };

 
  const defaultProfileImage = 'https://www.gravatar.com/avatar/?d=mp&s=200'; 
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
            <Link to="/mision" className="nav-button">Nuestra Misión</Link>
          </div>
        )}

        {adminUser ? (
          <div className="user-actions-logged">
            <div
              className="profile-container"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={adminUser.profile_image ? `https://aura-back-3h9b.onrender.com/${adminUser.profile_image}` : defaultProfileImage}
                alt="Profile"
                className="profile-picture"
              />
              {showPopup && (
                <div className="profile-popup">
                  <p><strong>Mail:</strong> {adminUser.email}</p>
                  <p><strong>Empresa:</strong> {adminUser.organization_name}</p> 
                  <p><strong>Rol:</strong> {adminUser.role || 'Admin'}</p> 
                </div>
              )}
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