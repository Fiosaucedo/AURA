import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './SueldoEmpleados.css';

const SueldoEmpleados = () => {
  const [sueldos, setSueldos] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexado
  const apiMonth = month + 1;

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const currentMonthName = monthNames[month];

  useEffect(() => {
    fetchSueldos();
  }, []); // Solo una vez al cargar

  const fetchSueldos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/monthly-salaries/${year}/${apiMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSueldos(data);
      } else {
        Swal.fire('Error', data.error || 'No se pudieron obtener los sueldos', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error al conectarse al servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generarSueldos = async () => {
    const confirm = await Swal.fire({
      title: '¿Generar sueldos del mes?',
      text: `Se generarán los sueldos para ${currentMonthName} ${year}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/generate-monthly-salaries/${year}/${apiMonth}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire('Éxito', data.message, 'success');
        fetchSueldos();
      } else {
        Swal.fire('Error', data.error || 'No se pudieron generar los sueldos', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error al conectarse al servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = async () => {
    const token = localStorage.getItem("token");
    const apiMonth = month + 1;

    try {
        const res = await fetch(`${API_URL}/monthly-salaries/export/${year}/${apiMonth}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Error al exportar sueldos");
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sueldos_${year}_${apiMonth}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo exportar el archivo", "error");
    }
};
  return (
    <div className="sueldos-container">
      <h2>Sueldos - {currentMonthName} {year}</h2>

      {loading && (
        <div className="loading-sueldos">
          <div className="spinner"></div>
          Procesando...
        </div>
      )}

      {!loading && (
        <div className="botones-acciones">
          <button onClick={generarSueldos} className="generate-button">
            Generar Sueldos del Mes
          </button>
          <button onClick={exportarExcel} className="export-button">
            Exportar Excel
          </button>
        </div>
      )}

      {!loading && sueldos.length > 0 && (
        <table className="sueldo-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Sueldo base</th>
              <th>Días trabajados</th>
              <th>Días justificados</th>
              <th>Días faltados</th>
              <th>Sueldo final</th>
            </tr>
          </thead>
          <tbody>
            {sueldos.map((s, i) => (
              <tr key={i}>
                <td>{s.employee}</td>
                <td>${s.base_salary?.toLocaleString('es-AR') ?? "N/A"}</td>
                <td>{s.present_days ?? "-"}</td>
                <td>{s.justified_days ?? "-"}</td>
                <td>{s.missed_days ?? "-"}</td>
                <td>${s.final_salary?.toLocaleString('es-AR') ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && sueldos.length === 0 && (
        <p className="no-data-message">No se han generado sueldos para este mes aún.</p>
      )}
    </div>
  );
};

export default SueldoEmpleados;
