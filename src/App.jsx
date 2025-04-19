import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ViewReclutador from './Pages/ViewReclutador'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/vista-reclutador" element={<ViewReclutador />} />
      </Routes>
    </Router>
  )
}

export default App
