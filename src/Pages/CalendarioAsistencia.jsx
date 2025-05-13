import React, { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarioAsistencia.css';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

const CalendarioAsistencia = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [asistencias, setAsistencias] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [columnaOrdenada, setColumnaOrdenada] = useState(null);
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [filtros, setFiltros] = useState({ presente: true, ausente: true, tarde: true });
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/attendance`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        const agrupadas = {};
        data.forEach(registro => {
          const fecha = registro.date;
          if (!agrupadas[fecha]) agrupadas[fecha] = [];
          agrupadas[fecha].push({
            nombre: registro.employee_name,
            estado: registro.status,
            horarioEntrada: registro.check_in,
            horarioSalida: registro.check_out
          });
        });
        setAsistencias(agrupadas);
        setCargando(false);
      })      
      .catch(err => {
        setError(err);
        setCargando(false);
      });
  }, []);

  const obtenerFechaFormateada = (fecha) => fecha.toISOString().split('T')[0];
  const empleadosDelDia = asistencias[obtenerFechaFormateada(fechaSeleccionada)] || [];

  const empleadosFiltrados = empleadosDelDia.filter(e => {
    if (e.estado === 'Presente' && filtros.presente) return true;
    if (e.estado === 'Ausente' && filtros.ausente) return true;
    if (e.estado === 'Tarde' && filtros.tarde) return true;
    return false;
  });

  const ordenarEmpleados = (empleados, columna, ascendente) => {
    if (!columna) return empleados;
    return [...empleados].sort((a, b) => {
      let comparison = 0;
      if (columna === 'nombre') comparison = a.nombre.localeCompare(b.nombre);
      else if (columna === 'estado') comparison = a.estado.localeCompare(b.estado);
      else if (columna === 'horario') {
        const toMin = h => h ? parseInt(h.split(':')[0]) * 60 + parseInt(h.split(':')[1]) : null;
        comparison = (toMin(a.horario) ?? 9999) - (toMin(b.horario) ?? 9999);
      }
      return ascendente ? comparison : -comparison;
    });
  };

  const handleOrdenar = (col) => {
    setColumnaOrdenada(columnaOrdenada === col ? col : col);
    setOrdenAscendente(columnaOrdenada === col ? !ordenAscendente : true);
  };

  const empleadosFiltradosOrdenados = useMemo(() => ordenarEmpleados(empleadosFiltrados, columnaOrdenada, ordenAscendente), [empleadosFiltrados, columnaOrdenada, ordenAscendente]);

  if (cargando) return <div>Cargando datos de asistencia...</div>;
  if (error) return <div>Error al cargar datos: {error.message}</div>;

  return (
    <div className="calendario-asistencia-contenedor">
      <div className="calendario-lado">
        <Calendar
          onChange={setFechaSeleccionada}
          value={fechaSeleccionada}
          tileClassName={({ date }) => {
            const f = obtenerFechaFormateada(date);
            if (asistencias[f]) {
              if (asistencias[f].some(e => e.estado === 'Ausente')) return 'tile-ausencia';
              return 'tile-presente';
            }
            return null;
          }}
          onClickDay={setFechaSeleccionada}
        />
      </div>
      <div className="detalle-lado">
        <div className="filtros-asistencia">
          <h3>Asistencia del {fechaSeleccionada.toLocaleDateString()}</h3>
          <div className="botones-filtro">
            <button className={`filtro-presente ${filtros.presente ? 'activo' : ''}`} onClick={() => setFiltros(prev => ({ ...prev, presente: !prev.presente }))}>Presentes</button>
            <button className={`filtro-ausente ${filtros.ausente ? 'activo' : ''}`} onClick={() => setFiltros(prev => ({ ...prev, ausente: !prev.ausente }))}>Ausentes</button>
            <button className={`filtro-tarde ${filtros.tarde ? 'activo' : ''}`} onClick={() => setFiltros(prev => ({ ...prev, tarde: !prev.tarde }))}>Tarde</button>
          </div>
        </div>
        <div className="tabla-scroll">
          <table className="tabla-asistencia">
            <thead>
              <tr>
                <th onClick={() => handleOrdenar('nombre')} style={{ cursor: 'pointer' }}>Nombre{columnaOrdenada === 'nombre' && (ordenAscendente ? <FaChevronUp /> : <FaChevronDown />)}</th>
                <th onClick={() => handleOrdenar('estado')} style={{ cursor: 'pointer' }}>Estado{columnaOrdenada === 'estado' && (ordenAscendente ? <FaChevronUp /> : <FaChevronDown />)}</th>
                <th onClick={() => handleOrdenar('horarioEntrada')} style={{ cursor: 'pointer' }}>Hora de llegada{columnaOrdenada === 'horarioEntrada' && (ordenAscendente ? <FaChevronUp /> : <FaChevronDown />)}</th>
                <th onClick={() => handleOrdenar('horarioSalida')} style={{ cursor: 'pointer' }}>Hora de salida{columnaOrdenada === 'horarioSalida' && (ordenAscendente ? <FaChevronUp /> : <FaChevronDown />)}</th>
              </tr>
            </thead>
            <tbody>
              {empleadosFiltradosOrdenados.map((e, index) => (
                <tr key={index} className={e.estado.toLowerCase()}>
                  <td>{e.nombre}</td>
                  <td><strong>{e.estado}</strong></td>
                  <td>{e.horarioEntrada || '-'}</td>
                  <td>{e.horarioSalida || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CalendarioAsistencia;
