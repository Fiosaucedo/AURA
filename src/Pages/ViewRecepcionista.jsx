import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { FaCamera, FaVideo } from 'react-icons/fa';
import Webcam from 'react-webcam';
import './ViewRecepcionista.css';

const ViewRecepcionista = () => {
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanTime, setScanTime] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleActivateCamera = () => {
    setShowCamera(true);
  };

  const handleScan = async () => {
    if (!webcamRef.current) return;

    const screenshot = webcamRef.current.getScreenshot();
    setScanning(true);

    setTimeout(() => {
      const success = Math.random() > 0.5;
      setScanning(false);

      if (success) {
        const now = new Date();
        const formattedTime = now.toLocaleString();
        setScanResult('success');
        setScanTime(formattedTime);
        Swal.fire({
          icon: 'success',
          title: 'Escaneo exitoso',
          text: `Asistencia grabada: ${formattedTime}`,
          confirmButtonColor: '#4e73df'
        });
      } else {
        setScanResult('failure');
        setScanTime(null);
        Swal.fire({
          icon: 'error',
          title: 'Escaneo Fallido',
          text: 'Fallo en los datos de escaneo. Por favor, intentelo de nuevo.',
          confirmButtonColor: '#d33'
        });
      }
    }, 1500);
  };

  return (
    <div className="receptionist-container">
      <div className="aura-label-recep">✨Aura✨</div>

      <h1 className="main-message">Sonría, lo estamos filmando 😄</h1>

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

          <button className="scan-button" onClick={handleScan} disabled={scanning}>
            <FaCamera style={{ marginRight: '8px' }} />
            {scanning ? 'Escaneando...' : 'Registrar asistencia'}
          </button>
        </>
      )}
    </div>
  );
};

export default ViewRecepcionista;
