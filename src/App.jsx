import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext'; 
import ViewReclutador from './Pages/ViewReclutador';
import ViewPostulante from './Pages/ViewPostulante';
import Home from './Pages/Home';
import DetalleCandidato from './Pages/DetalleCandidato';
import Login from './Pages/Login';
import CreateOrganization from './Pages/CreateOrganization'
import ViewSupervisor from './Pages/ViewSupervisor'
import SolicitudesDeSupervisor from './Pages/SolicitudesDeSupervisor'
import ViewRecepcionista from './Pages/ViewRecepcionista'
import ViewAdmin from './Pages/ViewAdmin';
import ViewAsistencias from './Pages/ViewAsistencias';
import ContactUs from './Pages/ContactUs';
import Services from './Pages/Services';
import ViewEmpleado from './Pages/ViewEmpleado';
import ProtectedRouteLayout from './layouts/ProtectedRouteLayout';
import NotFoundPage from './Pages/NotFoundPage';
import CambiarPassword from './Pages/CambiarPassword';
import RecuperarPassword from './Pages/RecuperarPassword';
import Welcome from './Pages/Welcome';
import AuraMision from './Pages/AuraMision';
import MensajeriaSuperadmin from './Pages/MensajeriaSuperadmin';
import CertificadosEnviados from './Pages/CertificadosEnviados';
import Metrics from './Pages/Metrics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vista-postulante" element={<ViewPostulante />} />
          <Route path="/contactanos" element={<ContactUs />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/mision" element={<AuraMision />} />
            
          <Route element={<ProtectedRouteLayout />}>
          <Route path="/bienvenida" element={<Welcome />} />
          <Route path="/vista-reclutador" element={<ViewReclutador />} />
          <Route path="/candidato/:id" element={<DetalleCandidato />} />
          <Route path="/create-organization" element={<CreateOrganization />} />
          <Route path="/vista-supervisor" element={<ViewSupervisor />} />
          <Route path="/reclutador-solicitudes-supervisor" element={<SolicitudesDeSupervisor />} />
          <Route path="/vista-recepcionista" element={<ViewRecepcionista />} />
          <Route path="/vista-admin" element={<ViewAdmin />} />
          <Route path="/asistencias" element={<ViewAsistencias />} />
          <Route path="/mensajeria-superadmin" element={<MensajeriaSuperadmin />} />          
          <Route path="/certificados" element={<CertificadosEnviados />} />
          <Route path="/metricas" element={<Metrics />} />
          <Route path="/vista-empleado" element={<ViewEmpleado />} />
          </Route>
          <Route path="/cambiar-password" element={<CambiarPassword />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;