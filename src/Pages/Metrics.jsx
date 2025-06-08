// Metrics.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Metrics.css';
import Header from '../components/Header';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Metrics = () => {
   
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const [categoria, setCategoria] = useState('reclutamiento');
    const [datosBrutos, setDatosBrutos] = useState([]);
    const [datosProcesados, setDatosProcesados] = useState([]);
    const [vista, setVista] = useState('grilla');
    const [filtroPeriodo, setFiltroPeriodo] = useState('mes');
    const [filtroRol, setFiltroRol] = useState('Todos');
    const [fechaBase, setFechaBase] = useState(new Date().toISOString().split('T')[0]);
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true); 

   
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

    //funciones auxiliares de fechas
    const getWeekDates = (baseDateStr) => {
        const base = new Date(baseDateStr + 'T12:00:00');
        const day = base.getDay();
        const mondayOffset = day === 0 ? 6 : day - 1;
        const monday = new Date(base);
        monday.setDate(base.getDate() - mondayOffset);

        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
    };

    const getUniqueAttendanceByDate = (allAttendanceRecords, dateStr) => {
        const recordsForDate = allAttendanceRecords.filter(d => d.date === dateStr);
        const uniqueByEmployee = {};
        for (const record of recordsForDate) {
            if (!uniqueByEmployee[record.employee_id] || new Date(record.timestamp) > new Date(uniqueByEmployee[record.employee_id].timestamp)) {
                uniqueByEmployee[record.employee_id] = record;
            }
        }
        return Object.values(uniqueByEmployee);
    };

    const calculateAttendanceMetrics = (records) => {
        return {
            Presentes: records.filter(d => d.status === 'Presente').length,
            Ausentes: records.filter(d => d.status === 'Ausente').length,
            'Llegadas Tarde': records.filter(d => d.status === 'Tarde').length,
            'Ausencias Justificadas': records.filter(d => d.status === 'Ausencia Justificada').length,
        };
    };

    const getPeriodKey = (dateStr, period) => {
        if (!dateStr) return 'Sin Fecha';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'Fecha Inválida';

        if (period === 'dia') return d.toISOString().split('T')[0];
        if (period === 'semana') {
            const yearStart = new Date(d.getFullYear(), 0, 1);
            const diff = (d - yearStart) / (1000 * 60 * 60 * 24);
            const weekNumber = Math.ceil((diff + yearStart.getDay() + 1) / 7);
            return `Semana ${weekNumber} de ${d.getFullYear()}`;
        }
        if (period === 'mes') return d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        if (period === 'anio') return d.getFullYear().toString();
        return 'Sin Fecha';
    };

    // --- Procesamiento de datos con useMemo ---
    const processData = useMemo(() => {
        if (!datosBrutos.length) {
            return [];
        }

        const processed = [];
        const baseDate = new Date(fechaBase + 'T12:00:00');

        if (categoria === 'asistencia') {
            if (filtroPeriodo === 'dia') {
                const uniqueRecords = getUniqueAttendanceByDate(datosBrutos, fechaBase);
                processed.push({
                    Periodo: fechaBase,
                    ...calculateAttendanceMetrics(uniqueRecords),
                });
            } else if (filtroPeriodo === 'semana') {
                const weekDates = getWeekDates(fechaBase);
                weekDates.forEach(dayStr => {
                    const uniqueRecords = getUniqueAttendanceByDate(datosBrutos, dayStr);
                    processed.push({
                        Periodo: dayStr,
                        ...calculateAttendanceMetrics(uniqueRecords),
                    });
                });
            } else if (filtroPeriodo === 'mes') {
                const year = baseDate.getFullYear();
                const monthlyAggregatedData = {};

                datosBrutos.filter(d => {
                    const recordDate = new Date(d.date + 'T12:00:00');
                    return !isNaN(recordDate) && recordDate.getFullYear() === year;
                })
                    .forEach(record => {
                        const recordDate = new Date(record.date + 'T12:00:00');
                        const monthKey = recordDate.toISOString().substring(0, 7);
                        if (!monthlyAggregatedData[monthKey]) {
                            monthlyAggregatedData[monthKey] = [];
                        }
                        monthlyAggregatedData[monthKey].push(record);
                    });

                Object.keys(monthlyAggregatedData).sort().forEach(monthKey => {
                    const recordsInMonth = monthlyAggregatedData[monthKey];
                    const uniqueDailyRecordsForMonth = {};
                    recordsInMonth.forEach(record => {
                        const dateKey = record.date;
                        const employeeId = record.employee_id;
                        const uniqueKey = `${dateKey}-${employeeId}`;
                        if (!uniqueDailyRecordsForMonth[uniqueKey] || new Date(record.timestamp) > new Date(uniqueDailyRecordsForMonth[uniqueKey].timestamp)) {
                            uniqueDailyRecordsForMonth[uniqueKey] = record;
                        }
                    });
                    const finalMonthlyRecords = Object.values(uniqueDailyRecordsForMonth);

                    processed.push({
                        Periodo: new Date(monthKey + '-01T12:00:00').toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
                        ...calculateAttendanceMetrics(finalMonthlyRecords),
                    });
                });

            } else if (filtroPeriodo === 'anio') {
                const yearlyAggregatedData = {};

                datosBrutos.filter(d => {
                    const recordDate = new Date(d.date + 'T12:00:00');
                    return !isNaN(recordDate);
                })
                    .forEach(record => {
                        const recordYear = new Date(record.date + 'T12:00:00').getFullYear();
                        if (!yearlyAggregatedData[recordYear]) {
                            yearlyAggregatedData[recordYear] = [];
                        }
                        yearlyAggregatedData[recordYear].push(record);
                    });

                Object.keys(yearlyAggregatedData).sort().forEach(yearKey => {
                    const recordsInYear = yearlyAggregatedData[yearKey];
                    const uniqueDailyRecordsForYear = {};
                    recordsInYear.forEach(record => {
                        const dateKey = record.date;
                        const employeeId = record.employee_id;
                        const uniqueKey = `${dateKey}-${employeeId}`;
                        if (!uniqueDailyRecordsForYear[uniqueKey] || new Date(record.timestamp) > new Date(uniqueDailyRecordsForYear[uniqueKey].timestamp)) {
                            uniqueDailyRecordsForYear[uniqueKey] = record;
                        }
                    });
                    const finalYearlyRecords = Object.values(uniqueDailyRecordsForYear);

                    processed.push({
                        Periodo: yearKey,
                        ...calculateAttendanceMetrics(finalYearlyRecords),
                    });
                });
            }
        }
        else if (categoria === 'reclutamiento' || categoria === 'entrevistas') {
            const groupedData = {};

            datosBrutos.forEach(candidato => {
                const candidateDate = typeof candidato.created_at === 'string' ? candidato.created_at : null;
                if (!candidateDate) return;

                const periodKey = getPeriodKey(candidateDate, filtroPeriodo);
                if (periodKey === 'Fecha Inválida' || periodKey === 'Sin Fecha') {
                    return;
                }

                if (!groupedData[periodKey]) {
                    groupedData[periodKey] = {
                        Periodo: periodKey,
                        'Total Candidatos': 0,
                        'Candidatos Aptos': 0,
                        'Candidatos No Aptos': 0,
                        'Candidatos Contratados': 0,
                        'Candidatos Rechazados': 0,
                        'Candidatos Pendientes': 0,
                    };
                }

                groupedData[periodKey]['Total Candidatos']++;
                if (candidato.is_apt === true) {
                    groupedData[periodKey]['Candidatos Aptos']++;
                } else if (candidato.is_apt === false) {
                    groupedData[periodKey]['Candidatos No Aptos']++;
                }

                if (categoria === 'entrevistas') {
                    if (candidato.status_entrevista === 'Contratado') {
                        groupedData[periodKey]['Candidatos Contratados']++;
                    } else if (candidato.status_entrevista === 'Rechazado') {
                        groupedData[periodKey]['Candidatos Rechazados']++;
                    } else {
                        groupedData[periodKey]['Candidatos Pendientes']++;
                    }
                }
            });

            Object.keys(groupedData).sort((a, b) => {
                if (filtroPeriodo === 'dia') {
                    return new Date(a + 'T12:00:00') - new Date(b + 'T12:00:00');
                }
                if (filtroPeriodo === 'semana') {
                    const [, weekA, , yearA] = a.split(' ');
                    const [, weekB, , yearB] = b.split(' ');
                    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
                    return parseInt(weekA) - parseInt(weekB);
                }
                if (filtroPeriodo === 'mes') {
                    const dateA = new Date(a.replace(' de ', ' 1, '));
                    const dateB = new Date(b.replace(' de ', ' 1, '));
                    return dateA - dateB;
                }
                return parseInt(a) - parseInt(b);
            }).forEach(key => {
                processed.push(groupedData[key]);
            });
        }

        return processed;
    }, [categoria, datosBrutos, filtroPeriodo, fechaBase]);

    // effect para obtener datos del usuario logeado
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
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
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
                const rol = data.role;

                if (!['recruiter', 'supervisor', 'admin'].includes(rol)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Acceso denegado',
                        text: 'No tenés permiso para acceder a esta sección.',
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

    // effect para obtener datos de la API
    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchData = async () => {
            setLoading(true); 
            try {
                let url;
                if (categoria === 'asistencia' || categoria === 'reclutamiento' || categoria === 'entrevistas') {
                    url = categoria === 'asistencia' ? `${API_URL}/attendance` : `${API_URL}/candidatos`;
                } else {
                    url = `${API_URL}/metrics/${categoria}?period=${filtroPeriodo}&role=${filtroRol}`;
                }

                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
                const data = await res.json();

                setDatosBrutos(data);
            } catch (err) {
                console.error('Error al obtener métricas:', err);
                setDatosBrutos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoria, filtroPeriodo, filtroRol, API_URL]);

 
    useEffect(() => {
        setDatosProcesados(processData);
    }, [processData]);

    // exportar a excel y pdf
    const exportarExcel = () => {
        const datosAExportar = datosProcesados;
        if (!datosAExportar.length) {
            Swal.fire('Atención', 'No hay datos para exportar a Excel.', 'info');
            return;
        }
        const ws = XLSX.utils.json_to_sheet(datosAExportar);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Métricas");
        XLSX.writeFile(wb, `metricas_${categoria}_${Date.now()}.xlsx`);
    };

    const exportarPDF = () => {
        const datosAExportar = datosProcesados;
        if (!datosAExportar.length) {
            Swal.fire('Atención', 'No hay datos para exportar a PDF.', 'info');
            return;
        }
        const doc = new jsPDF();
        doc.text(`Métricas de ${categoria}`, 14, 16);
        const cols = Object.keys(datosAExportar[0] || {});
        const rows = datosAExportar.map(d => cols.map(c => d[c]));
        doc.autoTable({ head: [cols], body: rows, startY: 20 });
        doc.save(`metricas_${categoria}_${Date.now()}.pdf`);
    };

    // renderizado de la grilla y gráficos
    const renderGrilla = () => {
        const dataToRender = datosProcesados;
        if (!dataToRender.length) return <p>No hay datos para mostrar en la grilla.</p>;

        return (
            <table className="tabla-metricas">
                <thead>
                    <tr>
                        {Object.keys(dataToRender[0] || {}).map((key, i) => <th key={i}>{key}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {dataToRender.map((fila, i) => (
                        <tr key={i}>
                            {Object.values(fila).map((valor, j) => <td key={j}>{valor}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderGrafico = () => {
        const dataToRender = datosProcesados;
        if (!dataToRender.length) return <p>No hay datos para mostrar.</p>;

        if (categoria === 'asistencia') {
            const totalPresentes = dataToRender.reduce((sum, d) => sum + (d.Presentes || 0), 0);
            const totalAusentes = dataToRender.reduce((sum, d) => sum + (d.Ausentes || 0), 0);
            const totalTardes = dataToRender.reduce((sum, d) => sum + (d['Llegadas Tarde'] || 0), 0);
            const totalJustificadas = dataToRender.reduce((sum, d) => sum + (d['Ausencias Justificadas'] || 0), 0);

            const sinDatosPie = (totalPresentes + totalAusentes + totalTardes + totalJustificadas) === 0;

            const pieData = sinDatosPie
                ? {
                    labels: ['Sin datos'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['#d3d3d3'],
                        borderWidth: 1
                    }]
                }
                : {
                    labels: ['Presentes', 'Ausentes', 'Llegadas Tarde', 'Ausencias Justificadas'],
                    datasets: [{
                        data: [totalPresentes, totalAusentes, totalTardes, totalJustificadas],
                        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
                        borderWidth: 1
                    }]
                };

            const pieOptions = {
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: `Resumen de Asistencia (${filtroPeriodo})` }
                }
            };

            const barLabels = dataToRender.map(d => d.Periodo);
            const barData = {
                labels: barLabels,
                datasets: [
                    {
                        label: 'Presentes',
                        backgroundColor: '#36A2EB',
                        data: dataToRender.map(d => d.Presentes || 0)
                    },
                    {
                        label: 'Ausentes',
                        backgroundColor: '#FF6384',
                        data: dataToRender.map(d => d.Ausentes || 0)
                    },
                    {
                        label: 'Llegadas Tarde',
                        backgroundColor: '#FFCE56',
                        data: dataToRender.map(d => d['Llegadas Tarde'] || 0)
                    },
                    {
                        label: 'Ausencias Justificadas',
                        backgroundColor: '#4BC0C0',
                        data: dataToRender.map(d => d['Ausencias Justificadas'] || 0)
                    }
                ]
            };

            const barOptions = {
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: `Asistencia por ${filtroPeriodo}` }
                },
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            };

            return (
                <div className="asistencia-graficos">
                    <div className="pie-chart-container">
                        <Pie data={pieData} options={pieOptions} />
                    </div>
                    <div className="bar-chart-container" style={{ marginTop: '40px' }}>
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
            );

        } else if (categoria === 'reclutamiento' || categoria === 'entrevistas') {
            const labels = dataToRender.map(d => d.Periodo);
            const datasets = [];

            if (categoria === 'reclutamiento') {
                datasets.push({
                    label: 'Total Candidatos',
                    backgroundColor: '#36A2EB',
                    data: dataToRender.map(d => d['Total Candidatos'] || 0)
                }, {
                    label: 'Candidatos Aptos',
                    backgroundColor: '#28a745',
                    data: dataToRender.map(d => d['Candidatos Aptos'] || 0)
                }, {
                    label: 'Candidatos No Aptos',
                    backgroundColor: '#dc3545',
                    data: dataToRender.map(d => d['Candidatos No Aptos'] || 0)
                });
            } else if (categoria === 'entrevistas') {
                datasets.push({
                    label: 'Candidatos Contratados',
                    backgroundColor: '#28a745',
                    data: dataToRender.map(d => d['Candidatos Contratados'] || 0)
                }, {
                    label: 'Candidatos Rechazados',
                    backgroundColor: '#dc3545',
                    data: dataToRender.map(d => d['Candidatos Rechazados'] || 0)
                }, {
                    label: 'Candidatos Pendientes',
                    backgroundColor: '#ffc107',
                    data: dataToRender.map(d => d['Candidatos Pendientes'] || 0)
                });
            }

            const barOptions = {
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: `Métricas de ${categoria} por ${filtroPeriodo}` }
                },
                responsive: true,
                scales: {
                    x: { stacked: true },
                    y: { beginAtZero: true, stacked: true }
                }
            };

            return <Bar data={{ labels, datasets }} options={barOptions} />;
        }

        const etiquetas = Object.keys(dataToRender[0] || {}).filter(k => k !== 'name' && k !== 'recruiter' && k !== 'busqueda' && k !== 'date' && k !== 'month' && k !== 'year' && k !== 'Periodo');
        const datosGrafico = {
            labels: dataToRender.map(d => d.name || d.recruiter || d.busqueda || d.date || d.month || d.year || d.Periodo),
            datasets: etiquetas.map((k, i) => ({
                label: k,
                data: dataToRender.map(d => d[k]),
                backgroundColor: `hsl(${i * 50}, 70%, 60%)`
            }))
        };
        return <Bar data={datosGrafico} />;
    };

    return (
        <div className="metricas-container">
            <Header adminUser={adminUser} onLogout={handleLogout} API_URL={API_URL} />
            <div className="metricas-content">
            <h1>Métricas del Negocio</h1>
            <div className="filtros-metricas">
                <select value={categoria} onChange={e => setCategoria(e.target.value)}>
                    <option value="reclutamiento">Reclutamiento</option>
                    <option value="entrevistas">Entrevistas y Contrataciones</option>
                    <option value="asistencia">Asistencia</option>
                </select>

                <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)}>
                    <option value="dia">Día</option>
                    <option value="semana">Semana</option>
                    <option value="mes">Mes</option>
                    <option value="anio">Año</option>
                </select>

                {categoria !== 'asistencia' && categoria !== 'reclutamiento' && categoria !== 'entrevistas' && (
                    <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
                        <option value="Todos">Todos los roles</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Operativo">Operativo</option>
                        <option value="Técnico">Técnico</option>
                    </select>
                )}

                {(categoria === 'asistencia' || categoria === 'reclutamiento' || categoria === 'entrevistas') && (
                    <input
                        type="date"
                        value={fechaBase}
                        onChange={e => setFechaBase(e.target.value)}
                        className="filtro-fecha-asistencia"
                    />
                )}

                <div className="botones-vista">
                    <button onClick={() => setVista('grilla')}>Grilla</button>
                    <button onClick={() => setVista('grafico')}>Gráfico</button>
                </div>

                <div className="botones-exportar">
                    <button onClick={exportarPDF}>Descargar PDF</button>
                    <button onClick={exportarExcel}>Descargar Excel</button>
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