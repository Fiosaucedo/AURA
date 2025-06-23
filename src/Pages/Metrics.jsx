import React, { useEffect, useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Metrics.css';
import Header from '../components/Header';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { BarChart, Table2, FileSpreadsheet} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Metrics = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState('reclutamiento');
  const [datosBrutos, setDatosBrutos] = useState([]);
  const [datosProcesados, setDatosProcesados] = useState([]);
  const [vista, setVista] = useState('grilla');
  const [filtroPeriodo, setFiltroPeriodo] = useState('mes');
  const [filtroRol, setFiltroRol] = useState('Todos');
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rolesEmpleados, setRolesEmpleados] = useState(['Todos']);
  const [reclutadores, setReclutadores] = useState(['Todos']);

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
        navigate('/login');
      }
    });
  };

  const processData = useMemo(() => {
    if (!datosBrutos.length) return [];

    if (categoria === 'asistencia' && filtroRol !== 'Todos') {
      return datosBrutos.filter(d => d.Rol === filtroRol);
    }

    if (categoria === 'reclutamiento' && filtroRol !== 'Todos') {
      return datosBrutos.filter(d => d.Reclutador === filtroRol);
    }

    return datosBrutos;
  }, [categoria, datosBrutos, filtroRol]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        title: 'Debes iniciar sesión',
        text: 'Por favor iniciá sesión para acceder a esta sección.',
        icon: 'error',
        confirmButtonText: 'Ir al login'
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            Swal.fire({
              title: 'Sesión expirada',
              text: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
              icon: 'warning',
              confirmButtonText: 'Ir al login'
            }).then(() => {
              navigate('/login');
            });
          }
          throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();

        if (!['manager', 'admin'].includes(data.role)) {
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
        console.error("Error al obtener datos del usuario:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate, API_URL]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let url = categoria === 'asistencia'
          ? `${API_URL}/attendance/metrics?periodo=${filtroPeriodo}`
          : `${API_URL}/recruitment/metrics?periodo=${filtroPeriodo}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

        const data = await res.json();

        if (categoria === 'reclutamiento') {
          const uniqueRecruiters = [...new Set(data.map(c => c.Reclutador).filter(Boolean))];
          setReclutadores(['Todos', ...uniqueRecruiters]);
        } else if (categoria === 'asistencia') {
          const uniqueRoles = [...new Set(data.map(a => a.Rol).filter(Boolean))];
          setRolesEmpleados(['Todos', ...uniqueRoles]);
        }

        setDatosBrutos(data);
      } catch (err) {
        console.error('Error al obtener métricas:', err);
        setDatosBrutos([]);
        Swal.fire('Error', 'No se pudieron cargar los datos. Inténtalo de nuevo.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoria, API_URL, filtroPeriodo]);

  useEffect(() => {
    setDatosProcesados(processData);
  }, [processData]);

  const exportarExcel = () => {
    if (!datosProcesados.length) {
      Swal.fire('Atención', 'No hay datos para exportar a Excel.', 'info');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(datosProcesados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Métricas");
    XLSX.writeFile(wb, `metricas_${categoria}_${Date.now()}.xlsx`);
  };

  const exportarPDF = () => {
    if (!datosProcesados.length) {
      Swal.fire('Atención', 'No hay datos para exportar a PDF.', 'info');
      return;
    }
    const doc = new jsPDF();
    doc.text(`Métricas de ${categoria}`, 14, 16);
    const cols = Object.keys(datosProcesados[0] || {});
    const rows = datosProcesados.map(d => cols.map(c => d[c]));
    doc.autoTable({ head: [cols], body: rows, startY: 20 });
    doc.save(`metricas_${categoria}_${Date.now()}.pdf`);
  };

  const NoDataMessage = () => (
    <div className="no-data-message">
      <p>No hay datos para mostrar con los filtros seleccionados.</p>
    </div>
  );

  const renderGrilla = () => {
    if (!datosProcesados.length) return <NoDataMessage />;
    const columns = Object.keys(datosProcesados[0] || {});
    return (
      <table className="tabla-metricas">
        <thead>
          <tr>{columns.map((key, i) => <th key={i}>{key}</th>)}</tr>
        </thead>
        <tbody>
          {datosProcesados.map((fila, i) => (
            <tr key={i}>
              {columns.map((key, j) => <td key={j}>{fila[key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderGrafico = () => {
  if (!datosProcesados.length) return <NoDataMessage />;

  const etiquetas = Object.keys(datosProcesados[0] || {}).filter(k => k !== 'Periodo' && k !== 'Reclutador');
  const labels = datosProcesados.map(d => d.Periodo + (d.Reclutador ? ` (${d.Reclutador})` : ''));
  const datasets = etiquetas.map((k, i) => ({
    label: k,
    data: datosProcesados.map(d => d[k]),
    backgroundColor: `hsl(${i * 50}, 70%, 60%)`
  }));

  const options = {
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: `Métricas de ${categoria} por ${filtroPeriodo}` }
    },
    responsive: true,
    maintainAspectRatio: false, 
    scales: { y: { beginAtZero: true } }
  };

  return (
    
    <div className="chart-container">
      <Bar data={{ labels, datasets }} options={options} />
    </div>
  );
};
const toggleView = () => {
    setVista(prevVista => (prevVista === 'grilla' ? 'grafico' : 'grilla'));
  };


  return (
    <div className="metricas-container">
      <Header adminUser={adminUser} onLogout={handleLogout} API_URL={API_URL} />
      <div className="metricas-content">
        <h1>Métricas del Negocio</h1>
        <div className="filtros-metricas">
          <select value={categoria} onChange={e => setCategoria(e.target.value)}>
            <option value="reclutamiento">Reclutamiento</option>
            <option value="asistencia">Asistencia</option>
          </select>

          <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)}>
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
            <option value="anio">Año</option>
          </select>

          {categoria === 'asistencia' && (
            <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
              {rolesEmpleados.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}

          {categoria === 'reclutamiento' && (
            <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
              {reclutadores.map(rec => <option key={rec} value={rec}>{rec}</option>)}
            </select>
          )}

          <div className="botones-vista">
            <button onClick={toggleView} title="Cambiar de vista">
              {vista === 'grilla' ? (
                <>
                  <BarChart size={20} />
                </>
              ) : (
                <>
                  <Table2 size={20} /> 
                </>
              )}
            </button>
          </div>

          <div className="botones-exportar">
            <button onClick={exportarExcel} title="Exportar en Excel"><FileSpreadsheet size={20}/></button>
          </div>
        </div>

        <div className="contenido-metricas">
          {loading ? (
            <div className="spinner-container">
              <div className="loading-spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : (
            vista === 'grilla' ? renderGrilla() : renderGrafico()
          )}
        </div>
      </div>
    </div>
  );
};

export default Metrics;
