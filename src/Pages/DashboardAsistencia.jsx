import React, { useState, useEffect } from 'react';
import './DashboardAsistencia.css';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardAsistencia = () => {
  const [data, setData] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_URL}/attendance`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [fecha]);

  const filtrarPorFecha = (fechaStr) => {
    const registros = data.filter(d => d.date === fechaStr);
    const porEmpleado = {};
    for (const r of registros) {
      if (!porEmpleado[r.employee_id]) porEmpleado[r.employee_id] = r;
    }
    return Object.values(porEmpleado);
  };

  const porEmpleadoUnico = filtrarPorFecha(fecha);
  const presentes = porEmpleadoUnico.filter(d => d.status === 'Presente').length;
  const ausentes = porEmpleadoUnico.filter(d => d.status === 'Ausente').length;
  const tardes = porEmpleadoUnico.filter(d => d.status === 'Tarde').length;

  const pieData = {
    labels: ['Presentes', 'Ausentes', 'Tarde'],
    datasets: [
      {
        data: [presentes, ausentes, tardes],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        borderWidth: 1
      }
    ]
  };

  const pieOptions = {
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Asistencia del día' }
    }
  };

  // Gráfico de barras semanal
  const getWeekDates = () => {
    const base = new Date(fecha);
    const day = base.getDay(); // 0 = domingo
    const monday = new Date(base);
    monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1)); // lunes anterior

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const weeklyData = weekDates.map(day => {
    const empleadosUnicos = filtrarPorFecha(day);
    return {
      fecha: day,
      presentes: empleadosUnicos.filter(e => e.status === 'Presente').length,
      ausentes: empleadosUnicos.filter(e => e.status === 'Ausente').length
    };
  });

  const barData = {
    labels: weeklyData.map(d => d.fecha),
    datasets: [
      {
        label: 'Presentes',
        backgroundColor: '#36A2EB',
        data: weeklyData.map(d => d.presentes)
      },
      {
        label: 'Ausentes',
        backgroundColor: '#FF6384',
        data: weeklyData.map(d => d.ausentes)
      }
    ]
  };

  const barOptions = {
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Asistencia semanal' }
    },
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="dashboard-asistencia">
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />

      <div className="pie-chart-container">
        <Pie data={pieData} options={pieOptions} />
      </div>

      <div className="bar-chart-container" style={{ marginTop: '40px' }}>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
};

export default DashboardAsistencia;
