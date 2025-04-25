import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ViewReclutador from './Pages/ViewReclutador'
import ViewPostulante from './Pages/ViewPostulante'
import DetalleCandidato from './Pages/DetalleCandidato'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/vista-reclutador" element={<ViewReclutador />} />
        <Route path="/vista-postulante" element={<ViewPostulante />} />
        <Route path="/candidato/:id" element={<DetalleCandidato />} />
      </Routes>
    </Router>
  )
}

export default App
