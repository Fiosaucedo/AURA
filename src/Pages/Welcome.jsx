import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Swal from 'sweetalert2';
import './Welcome.css';

const ROLES = {
  employee: 'Empleado',
  supervisor: 'Supervisor',
  admin: 'Admin RRHH',
  recruiter: 'Reclutador',
  ninguno: 'Ninguno',
};

const roleMapping = {
  recruiter: ROLES.recruiter,
  supervisor: ROLES.supervisor,
  admin: ROLES.admin,
  empleado: ROLES.empleado,
};

const contenidoPorRol = {
  [ROLES.empleado]: {
    titulo: 'Como Empleado, desde tu portal puedes:',
    acciones: [
      'Consultar y actualizar tu información personal.',
      'Visualizar tus recibos de sueldo.',
      'Gestionar tus ausencias (vacaciones, licencias).',
      'Acceder a documentos importantes de la empresa.',
      'Ver el organigrama y directorio de compañeros.',
    ],
  },
  [ROLES.supervisor]: {
    titulo: 'Con tu rol de Manager, puedes:',
    acciones: [
      'Gestionar solicitudes de tu equipo (vacaciones, permisos).',
      'Visualizar información y perfiles de tus colaboradores.',
      'Realizar y dar seguimiento a evaluaciones de desempeño.',
      'Acceder a reportes y métricas clave de tu equipo.',
      'Comunicar novedades y asignar tareas a tu equipo.',
    ],
  },
  [ROLES.admin]: {
    titulo: 'Como Administrador de RRHH, tienes acceso a:',
    acciones: [
      'Gestión integral de empleados (altas, bajas, modificaciones).',
      'Administración de la estructura organizativa y puestos.',
      'Procesamiento y consulta de nóminas (si aplica).',
      'Generación de reportes y analíticas de RRHH.',
      'Configuración general del sistema y permisos de usuarios.',
      'Gestionar comunicaciones internas y políticas.',
    ],
  },
  [ROLES.recruiter]: {
    titulo: 'Con tu rol de Reclutador, puedes:',
    acciones: [
      'Gestionar y publicar ofertas de empleo.',
      'Administrar la base de datos de candidatos y sus perfiles.',
      'Realizar el seguimiento de candidatos en los procesos de selección.',
      'Agendar y coordinar entrevistas.',
      'Generar reportes sobre el estado de las vacantes y procesos.',
    ],
  },
  [ROLES.ninguno]: {
    titulo: 'Bienvenido al Sistema de RRHH.',
    acciones: ['Por favor, contacta al administrador si no ves las opciones de tu rol.'],
  }
};


const RoleSpecificContent = ({ rol }) => {
  const contenido = contenidoPorRol[rol] || contenidoPorRol[ROLES.ninguno];

  return (
    <main>
      <h2>{contenido.titulo}</h2>
      <ul>
        {contenido.acciones.map((accion, index) => (
          <li key={index}>{accion}</li>
        ))}
      </ul>
    </main>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Error fetching user info:", res.status);
          navigate("/login");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setCurrentUser(data); 
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, API_URL]);

  if (loading) {
    return (
      <div>
        <div>
          <p>Cargando información del usuario...</p>
          {/* Puedes agregar un spinner aquí */}
        </div>
      </div>
    );
  }

  const userRole = currentUser ? (roleMapping[currentUser.role] || ROLES.ninguno) : ROLES.ninguno;
  const userName = currentUser ? (currentUser.name || 'Usuario') : 'Invitado';

  return (
    <div className='welcome-container'>
      <Header adminUser={currentUser} onLogout={handleLogout} VITE_API_URL={API_URL} />
      <div className='welcome-content'>
        <h1>Bienvenido/a a Aura!</h1>
        
        {userRole === ROLES.ninguno ? (
          <div>
            <p>Bienvenido al Sistema de RRHH.</p>
            <p>Por favor, inicia sesión para ver tu contenido.</p>
          </div>
        ) : (
          <RoleSpecificContent rol={userRole} />
        )}

        <footer>
          <p>&copy; {new Date().getFullYear()} Tu Sistema de RRHH. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;