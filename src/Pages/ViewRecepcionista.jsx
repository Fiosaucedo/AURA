import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaCamera, FaVideo, FaSignInAlt, FaSignOutAlt, FaUserPlus, FaDownload,FaUpload } from 'react-icons/fa';
import Webcam from 'react-webcam';
import './ViewRecepcionista.css';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { VideoOff } from 'lucide-react';
import Select from 'react-select';

const ViewRecepcionista = () => {
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [scanningIn, setScanningIn] = useState(false);
  const [scanningOut, setScanningOut] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [hasFace, setHasFace] = useState(false);
  const [mobileAction, setMobileAction] = useState('');
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

  const opciones = empleados.map(emp => ({
  value: emp.id,
  label: emp.dni + ' - ' + emp.name,
}));

const handleMobileActionChange = (e) => {
      const action = e.target.value;
      setMobileAction(action);

      switch (action) {
        case 'registrar-entrada':
          registrarAsistencia("entrada");
          break;
        case 'registrar-salida':
          registrarAsistencia("salida");
          break;
        case 'registrar-faceid':
          recognizeFace();
          break;
        case 'asignar-rostro':
          assignFaceToEmployee();
          break;
        case 'descargar-template':
          descargarTemplate();
          break;
        case 'cargar-asistencias':
          document.getElementById('upload-template')?.click();
          break;
        default:
          break;
      }  setMobileAction('');
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
        const employeeName = data.employee_name;
        const employeeId = data.employee_id;
         Swal.fire({
          title: `Pudimos reconocer a ${employeeName}`,
          text: "Registramos la asistencia?.",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#28a745', 
          cancelButtonColor: '#dc3545', 
          confirmButtonText: 'Sí, registrar ingreso',
          cancelButtonText: 'No, cancelar'
        }).then(async (result) => {
          if (result.isConfirmed) {
    
            await registrarAsistencia("entrada", employeeId); 
            setRecognizedEmployeeName(employeeName); 
          } else {

            Swal.fire({
              icon: 'info',
              title: 'Registro cancelado',
              text: 'El ingreso no fue registrado.',
              confirmButtonColor: '#4e73df'
            });
            setRecognizedEmployeeName(''); 
          }
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

   const handleLogout = () => {
        Swal.fire({
          title: '¿Cerrar sesión?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'No'
        }).then(result => {
          if (result.isConfirmed) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        });
      };

  const descargarTemplate = async () => {
  try {
    const response = await fetch(`${API_URL}/attendance/download-template`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_asistencia.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Error al descargar el template',
      text: err.message,
      confirmButtonColor: '#d33'
    });
  }
};

const cargarAsistenciasManual = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_URL}/attendance/upload-attendance-file`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Asistencias cargadas',
        text: data.message,
        confirmButtonColor: '#4e73df'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error en la carga',
        text: data.error || 'Ocurrió un problema',
        confirmButtonColor: '#d33'
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Error en la solicitud',
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
  <Header adminUser={adminUser} onLogout={handleLogout} VITE_API_URL={API_URL} />
  <h1 className="main-message">Sonría, lo estamos filmando 😄</h1>

  <div className="main-content">
    <div className="camera-section">
      {showCamera ? (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="webcam"
        />
      ) : (
        <div className="camera-placeholder">
          <VideoOff className="webcam-icon" />
          <p>La cámara está desactivada</p>
          <button className="scan-button" onClick={handleActivateCamera}>
            <FaVideo style={{ marginRight: '8px' }} />
            Activar cámara
          </button>
        </div>
      )}

      {recognizedEmployeeName && (
        <div className="recognized-banner">
          ✅ Reconocimiento exitoso: <strong>{recognizedEmployeeName}</strong>
        </div>
      )}
    </div>

    <div className="controls-section">
      <label>Seleccionar empleado:</label>
      <Select
        options={opciones}
        value={opciones.find(op => op.value === selectedId) || null}
        onChange={op => setSelectedId(op?.value || '')}
        placeholder="Selecciona un Empleado"
        isClearable
        className="react-select"
        classNamePrefix="react-select"
      />

      <p className={`status-message ${hasFace ? 'success' : 'warning'}`}>
        {hasFace
          ? '✅ Este empleado tiene un rostro asignado'
          : '⚠️ Por favor asigne un rostro para este empleado'}
      </p>

         <select
          className="mobile-select-actions"
          value={mobileAction}
          onChange={handleMobileActionChange}
          aria-label="Acciones de asistencias"
        >
          <option value="" disabled>Seleccione una acción</option>
          <option value="registrar-entrada">Registrar entrada Manual</option>
          <option value="registrar-salida">Registrar salida Manual</option>
          <option value="registrar-faceid">Registrar Entrada con FaceID</option>
          {!hasFace && <option value="asignar-rostro">Asignar rostro al empleado</option>}
          <option value="descargar-template">Descargar template asistencia manual</option>
          <option value="cargar-asistencias">Ingresar asistencias manuales</option>
        </select>
      <div className="button-group">
        <button
          className="scan-button entrada"
          onClick={() => registrarAsistencia("entrada")}
          disabled={!selectedId || scanningIn}
        >
          <FaSignInAlt style={{ marginRight: '8px' }} />
          {scanningIn ? 'Registrando...' : 'Registrar entrada Manual'}
        </button>
        <button
          className="scan-button salida"
          onClick={() => registrarAsistencia("salida")}
          disabled={!selectedId || scanningOut}
        >
          <FaSignOutAlt style={{ marginRight: '8px' }} />
          {scanningOut ? 'Registrando...' : 'Registrar salida Manual'}
        </button>
        <button
          className="scan-button facial"
          onClick={recognizeFace}
          disabled={!selectedId}
        >
          <FaCamera style={{ marginRight: '8px' }} />
          Registrar Entrada con FaceID
        </button>
        {!hasFace && (
          <button
            className="scan-button facial"
            onClick={assignFaceToEmployee}
            disabled={!selectedId}
          >
            <FaUserPlus style={{ marginRight: '8px' }} />
            Asignar rostro al empleado
          </button>
        )}
        <button className="scan-button template" onClick={descargarTemplate}>
        <FaDownload style={{ marginRight: '8px' }} />
        Descargar template asistencia manual

     
      </button>

      <button
        className="scan-button template"
        onClick={() => document.getElementById('upload-template')?.click()}
      >
        <FaUpload style={{ marginRight: '8px' }} />
        Ingresar asistencias manuales
      </button>
      <input
        type="file"
        id="upload-template"
        accept=".xlsx"
        style={{ display: 'none' }}
        onChange={cargarAsistenciasManual}
      />

      </div>
    </div>
  </div>
</div>
  );
}
export default ViewRecepcionista;