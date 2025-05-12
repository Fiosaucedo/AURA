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

  useEffect(() => {
    fetch('/asistencias.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const datosProcesados = {};
        data.forEach(registro => {
          datosProcesados[registro.fecha] = registro.empleados;
        });
        setAsistencias(datosProcesados);
        setCargando(false);
      })
      .catch(err => {
        setError(err);
        setCargando(false);
        console.error('Error al cargar asistencias:', err);
      });
  }, []);

  const obtenerFechaFormateada = (fecha) => {
    return fecha.toISOString().split('T')[0];
  };

  const toggleFiltro = (estado) => {
    setFiltros((prev) => ({
      ...prev,
      [estado]: !prev[estado],
    }));
  };

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

      if (columna === 'nombre') {
        comparison = a.nombre.localeCompare(b.nombre);
      } else if (columna === 'estado') {
        comparison = a.estado.localeCompare(b.estado);
      } else if (columna === 'horario') {
        const convertirHoraAMinutos = (hora) => {
          if (!hora || hora === '-') return null;
          const [horas, minutos] = hora.split(':').map(Number);
          return (horas * 60) + minutos;
        };

        const minutosA = convertirHoraAMinutos(a.horario);
        const minutosB = convertirHoraAMinutos(b.horario);

        if (minutosA === null && minutosB !== null) comparison = 1;
        else if (minutosA !== null && minutosB === null) comparison = -1;
        else if (minutosA === null && minutosB === null) comparison = 0;
        else comparison = minutosA - minutosB;
      }

      return ascendente ? comparison : -comparison;
    });
  };

  const handleOrdenar = (columna) => {
    if (columnaOrdenada === columna) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setColumnaOrdenada(columna);
      setOrdenAscendente(true);
    }
  };

  const mostrarDetalleDia = (date) => {
    setFechaSeleccionada(date);
    setColumnaOrdenada(null);
    setOrdenAscendente(true);
  };

  const getFlechaOrden = (columna) => {
    if (columnaOrdenada !== columna) return null;
    return ordenAscendente ? (
      <FaChevronUp className="flecha-orden" />
    ) : (
      <FaChevronDown className="flecha-orden" />
    );
  };

  const empleadosFiltradosOrdenados = useMemo(() => {
    return ordenarEmpleados(empleadosFiltrados, columnaOrdenada, ordenAscendente);
  }, [empleadosFiltrados, columnaOrdenada, ordenAscendente]);

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
          onClickDay={mostrarDetalleDia}
        />
      </div>

      <div className="detalle-lado">
        <div className="filtros-asistencia">
          <h3>Asistencia del {fechaSeleccionada.toLocaleDateString()}</h3>
          <div className="botones-filtro">
            <button
              className={`filtro-presente ${filtros.presente ? 'activo' : ''}`}
              onClick={() => toggleFiltro('presente')}
            >
              Presentes
            </button>
            <button
              className={`filtro-ausente ${filtros.ausente ? 'activo' : ''}`}
              onClick={() => toggleFiltro('ausente')}
            >
              Ausentes
            </button>
            <button
              className={`filtro-tarde ${filtros.tarde ? 'activo' : ''}`}
              onClick={() => toggleFiltro('tarde')}
            >
              Tarde
            </button>
          </div>
        </div>
        <div className="tabla-scroll">
          <table className="tabla-asistencia">
            <thead>
              <tr>
                <th onClick={() => handleOrdenar('nombre')} style={{ cursor: 'pointer' }}>
                  Nombre{getFlechaOrden('nombre')}
                </th>
                <th onClick={() => handleOrdenar('estado')} style={{ cursor: 'pointer' }}>
                  Estado{getFlechaOrden('estado')}
                </th>
                <th onClick={() => handleOrdenar('horario')} style={{ cursor: 'pointer' }}>
                  Hora de llegada{getFlechaOrden('horario')}
                </th>
              </tr>
            </thead>
            <tbody>
              {empleadosFiltradosOrdenados.map((e, index) => (
                <tr key={index} className={e.estado.toLowerCase()}>
                  <td>{e.nombre}</td>
                  <td><strong>{e.estado}</strong></td>
                  <td>{e.horario || '-'}</td>
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