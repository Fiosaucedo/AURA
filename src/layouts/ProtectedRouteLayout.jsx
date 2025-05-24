// layouts/ProtectedRouteLayout.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const ProtectedRouteLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error en validación de ProtectedRouteLayout', err);
      } finally {
        setIsLoading(false);
      }
      
    };

    validateUser();
  }, []);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '60px', flexGrow: 1, padding: '0px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedRouteLayout;
