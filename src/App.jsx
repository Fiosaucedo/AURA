import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext'; 
import ViewReclutador from './Pages/ViewReclutador';
import ViewPostulante from './Pages/ViewPostulante';
import Home from './Pages/Home';
import DetalleCandidato from './Pages/DetalleCandidato';
import Login from './Pages/Login';
import CreateOrganization from './Pages/CreateOrganization'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vista-reclutador" element={<ViewReclutador />} />
          <Route path="/vista-postulante" element={<ViewPostulante />} />
          <Route path="/candidato/:id" element={<DetalleCandidato />} />
          <Route path="/create-organization" element={<CreateOrganization />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
