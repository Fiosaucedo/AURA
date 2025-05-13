import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaCamera, FaVideo, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import Webcam from 'react-webcam';
import './ViewRecepcionista.css';
import { useNavigate } from 'react-router-dom';

const ViewRecepcionista = () => {
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [scanningIn, setScanningIn] = useState(false);
  const [scanningOut, setScanningOut] = useState(false);
    const [empleados, setEmpleados] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: 'Debes iniciar sesión',
        text: 'Por favor iniciá sesión para acceder a esta sección.',
        icon: 'error',
        confirmButtonText: 'Ir al login'
      }).then(() => {
        window.location.href = '/login';
      });
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!['admin', 'receptionist'].includes(data.role)) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No tenés permiso para acceder a esta sección.',
            confirmButtonText: 'Ir al login'
          }).then(() => {
            navigate("/login");
          });
          return;
        }
        setAdminUser(data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    const fetchEmpleados = async () => {
      try {
        const res = await fetch(`${API_URL}/employees`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setEmpleados(data);
        if (data.length > 0) setSelectedId(data[0].id);
      } catch (err) {
        console.error("Error al obtener empleados:", err);
      }
    };

    fetchUser();
    fetchEmpleados();
  }, []);

  const handleActivateCamera = () => {
    setShowCamera(true);
  };

  const registrarAsistencia = async (tipo) => {
    if (!selectedId) return;
    const token = localStorage.getItem("token");
  
    const now = new Date();
    const isoDate = now.toISOString().split("T")[0];
    const hora = now.toTimeString().slice(0, 8);
  
    const payload = {
      employee_id: selectedId,
      date: isoDate,
    };
  
    let endpoint = '';
    let setLoading = () => {};
  
    if (tipo === "entrada") {
      payload.check_in = hora;
      payload.status = "Presente";
      endpoint = "/attendance/checkin";
      setLoading = setScanningIn;
      setLoading(true);
    } else {
      payload.check_out = hora;
      endpoint = "/attendance/checkout";
      setLoading = setScanningOut;
      setLoading(true);
    }
  
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
  
      const data = await res.json();
      setLoading(false);
  
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: tipo === "entrada" ? 'Entrada registrada' : 'Salida registrada',
          text: `Empleado ID: ${selectedId} - Hora: ${hora}`,
          confirmButtonColor: '#4e73df'
        });
      } else {
        throw new Error(data.error || 'Fallo al registrar asistencia');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar asistencia',
        text: err.message,
        confirmButtonColor: '#d33'
      });
    }
  };
  

  return (
    <div className="receptionist-container">
      <div className="aura-label-recep">✨Aura✨</div>
      <h1 className="main-message">Sonría, lo estamos filmando 😄</h1>

      {empleados.length > 0 && (
        <div className="selector-empleado">
          <label>Seleccionar empleado:</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            {empleados.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      )}

      {!showCamera ? (
        <button className="scan-button" onClick={handleActivateCamera}>
          <FaVideo style={{ marginRight: '8px' }} />
          Activar cámara
        </button>
      ) : (
        <>
          <div className="webcam-wrapper">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
              className="webcam"
            />
          </div>
          <div className="button-group">
            <button
              className="scan-button entrada"
              onClick={() => registrarAsistencia("entrada")}
              disabled={scanningIn}
            >
              <FaSignInAlt style={{ marginRight: '8px' }} />
              {scanningIn ? 'Registrando...' : 'Registrar entrada'}
            </button>
            <button
              className="scan-button salida"
              onClick={() => registrarAsistencia("salida")}
              disabled={scanningOut}
            >
              <FaSignOutAlt style={{ marginRight: '8px' }} />
              {scanningOut ? 'Registrando...' : 'Registrar salida'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewRecepcionista;
