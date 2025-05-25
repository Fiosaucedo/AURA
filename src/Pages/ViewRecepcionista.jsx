import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaCamera, FaVideo, FaSignInAlt, FaSignOutAlt, FaUserPlus } from 'react-icons/fa';
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
  const [hasFace, setHasFace] = useState(false);
  const [recognizedEmployeeName, setRecognizedEmployeeName] = useState('');
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

  useEffect(() => {
    if (!selectedId) return;
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/employees/${selectedId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setHasFace(!!data.face_encoding))
      .catch(() => setHasFace(false));
  }, [selectedId]);

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
    let setLoading = () => { };

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

  const recognizeFace = async () => {
    const token = localStorage.getItem("token");
    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not capture image.' });
      return;
    }

    const blob = await (await fetch(imageSrc)).blob();
    const formData = new FormData();
    formData.append("image", blob, "face.jpg");

    try {
      const res = await fetch(`${API_URL}/attendance/face-check`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setRecognizedEmployeeName(data.employee_name);
        Swal.fire({
          icon: 'success',
          title: 'Face recognized',
          text: data.message,
          confirmButtonColor: '#4e73df'
        });
      } else {
        setRecognizedEmployeeName('');
        Swal.fire({
          icon: 'warning',
          title: 'Not recognized',
          text: data.error || 'Face not found',
          confirmButtonColor: '#d33'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Recognition error',
        text: err.message,
        confirmButtonColor: '#d33'
      });
    }
  };

  const assignFaceToEmployee = async () => {
    const token = localStorage.getItem("token");
    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc || !selectedId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Missing image or employee selection' });
      return;
    }

    const blob = await (await fetch(imageSrc)).blob();
    const formData = new FormData();
    formData.append("image", blob, "base.jpg");

    try {
      const res = await fetch(`${API_URL}/employees/${selectedId}/upload-face`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setHasFace(true);
        Swal.fire({
          icon: 'success',
          title: 'Face assigned',
          text: data.message,
          confirmButtonColor: '#4e73df'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Assignment failed',
          text: data.error || 'Something went wrong',
          confirmButtonColor: '#d33'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Request error',
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

      {hasFace ? (
        <p className="status-message success">✅ Este empleado tiene un rostro asignado</p>
      ) : (
        <p className="status-message warning">⚠️ Por favor asigne un rostro para este empleado</p>
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

          {recognizedEmployeeName && (
            <div className="recognized-banner">
              ✅ Reconocimiento exitoso: <strong>{recognizedEmployeeName}</strong>
            </div>
          )}

          <div className="button-group">
            <button className="scan-button entrada" onClick={() => registrarAsistencia("entrada")} disabled={scanningIn}>
              <FaSignInAlt style={{ marginRight: '8px' }} />
              {scanningIn ? 'Registrando...' : 'Registrar entrada manual (empleado seleccionado)'}
            </button>
            <button className="scan-button salida" onClick={() => registrarAsistencia("salida")} disabled={scanningOut}>
              <FaSignOutAlt style={{ marginRight: '8px' }} />
              {scanningOut ? 'Registrando...' : 'Registrar salida manual (empleado seleccionado)'}
            </button>
            <button className="scan-button facial" onClick={recognizeFace}>
              <FaCamera style={{ marginRight: '8px' }} />
              Registrar asistencia automática (reconocimiento facial)
            </button>
            {!hasFace && (
              <button className="scan-button assign" onClick={assignFaceToEmployee}>
                <FaUserPlus style={{ marginRight: '8px' }} />
                Asignar rostro a empleado seleccionado
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ViewRecepcionista;
