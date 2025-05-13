import React, { useState, useEffect } from 'react';
import './DashboardAsistencia.css';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const fetchAsistencias = async () => {
    const response = await fetch('/asistencias.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

const procesarAsistenciasHoy = (data, fechaHoy) => {
    const registroHoy = data.find(registro => registro.fecha === fechaHoy);
    return registroHoy ? registroHoy.empleados : [];
};

const procesarAsistenciaSemanal = (data, fechaReferencia) => {
    const fecha = new Date(fechaReferencia);
    const primerDiaSemana = new Date(fecha);
    const diaSemana = fecha.getDay();
    const offset = diaSemana === 0 ? -6 : 1 - diaSemana;
    primerDiaSemana.setDate(fecha.getDate() + offset);

    const asistenciaSemanal = [];
    for (let i = 0; i < 7; i++) {
        const fechaActual = new Date(primerDiaSemana);
        fechaActual.setDate(primerDiaSemana.getDate() + i);
        const fechaFormateada = fechaActual.toISOString().split('T')[0];
        const registroDia = data.find(r => r.fecha === fechaFormateada);
        const presentes = registroDia ? registroDia.empleados.filter(e => e.estado === 'Presente').length : 0;
        const ausentes = registroDia ? registroDia.empleados.filter(e => e.estado === 'Ausente').length : 0;
        asistenciaSemanal.push({ fecha: fechaFormateada, presentes, ausentes });
    }
    return asistenciaSemanal;
};

const obtenerEmpleadosEnLicencia = (data, fechaSeleccionada) => {
    const empleadosLicencia = [];
    const fechaSeleccion = new Date(fechaSeleccionada);

    data.forEach((registro) => {
        registro.empleados.forEach((empleado) => {
            if (empleado.estado === 'Licencia' && empleado.inicioLicencia && empleado.finLicencia) {
                const inicio = new Date(empleado.inicioLicencia);
                const fin = new Date(empleado.finLicencia);

                inicio.setHours(0, 0, 0, 0);
                fin.setHours(23, 59, 59, 999);
                fechaSeleccion.setHours(0, 0, 0, 0);

                if (fechaSeleccion >= inicio && fechaSeleccion <= fin) {
                    empleadosLicencia.push({
                        nombre: empleado.nombre,
                        motivo: empleado.motivoLicencia,
                        inicio: empleado.inicioLicencia,
                        fin: empleado.finLicencia,
                    });
                }
            }
        });
    });
    return empleadosLicencia;
};

const DashboardAsistencia = () => {
    const [asistenciasHoy, setAsistenciasHoy] = useState([]);
    const [asistenciaSemanal, setAsistenciaSemanal] = useState([]);
    const [filtros, setFiltros] = useState({
        sector: '',
        fecha: new Date().toISOString().split('T')[0],
    });
    const [sectoresUnicos, setSectoresUnicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [presentesHoy, setPresentesHoy] = useState(0);
    const [ausentesHoy, setAusentesHoy] = useState(0);
    const [tardesHoy, setTardesHoy] = useState(0);
    const [ausentesDiaSeleccionado, setAusentesDiaSeleccionado] = useState([]);
    const [mostrarPopupAusentes, setMostrarPopupAusentes] = useState(false);
    const [dataOriginal, setDataOriginal] = useState([]);
    const [licencias, setLicencias] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchAsistencias();
                setDataOriginal(data);
                const hoy = procesarAsistenciasHoy(data, filtros.fecha);
                const semanal = procesarAsistenciaSemanal(data, filtros.fecha);
                const sectores = [...new Set(data.flatMap(registro => registro.empleados.map(e => e.sector)))];
                const empleadosLicencia = obtenerEmpleadosEnLicencia(data, filtros.fecha);

                setLicencias(empleadosLicencia);
                setAsistenciasHoy(hoy);
                setAsistenciaSemanal(semanal);
                setSectoresUnicos(sectores);
                setPresentesHoy(hoy.filter(e => e.estado === 'Presente').length);
                setAusentesHoy(hoy.filter(e => e.estado === 'Ausente').length);
                setTardesHoy(hoy.filter(e => e.estado === 'Tarde').length);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [filtros.fecha]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const dataGraficoHoy = {
        labels: (presentesHoy + ausentesHoy + tardesHoy === 0) ? ['Sin Datos'] : ['Presentes', 'Ausentes', 'Tardes'].filter((_, index) => [presentesHoy, ausentesHoy, tardesHoy][index] > 0),
        datasets: [
            {
                data: (presentesHoy + ausentesHoy + tardesHoy === 0) ? [1] : [presentesHoy, ausentesHoy, tardesHoy].filter(count => count > 0),
                backgroundColor: (presentesHoy + ausentesHoy + tardesHoy === 0) ? ['#ccc'] : [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                ],
                borderColor: (presentesHoy + ausentesHoy + tardesHoy === 0) ? ['#ccc'] : [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const optionsGraficoHoy = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Asistencias del día',
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    padding: 15,
                },
            },
        },
    };

    const dataGraficoSemanal = {
        labels: asistenciaSemanal.map(dia => dia.fecha),
        datasets: [
            {
                label: 'Presentes',
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                data: asistenciaSemanal.map(dia => dia.presentes),
            },
            {
                label: 'Ausentes',
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                data: asistenciaSemanal.map(dia => dia.ausentes),
            },
        ],
    };

    const optionsGraficoSemanal = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Asistencia Semanal',
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.formattedValue;
                        if (label === 'Ausentes' && value > 0) {
                            const fechaSeleccionada = dataGraficoSemanal.labels[context.dataIndex];
                            const registroDia = dataOriginal.find(r => r.fecha === fechaSeleccionada);
                            if (registroDia && registroDia.empleados) {
                                const listaAusentesDia = registroDia.empleados
                                    .filter(empleado => empleado.estado === 'Ausente')
                                    .map(empleado => empleado.nombre) || [];
                                const primerosCinco = listaAusentesDia.slice(0, 5).join(', ');
                                return `${label}: ${value} (${primerosCinco}${listaAusentesDia.length > 5 ? ', ...' : ''})`;
                            }
                        }
                        return `${label}: ${value}`;
                    },
                    footer: (context) => {
                        if (context[0].dataset.label === 'Ausentes' && context[0].formattedValue > 0) {
                            return 'Hacé click para ver la lista completa';
                        }
                        return null;
                    },
                },
            },
        },
        onClick: (event, elements, chart) => {
            if (elements.length > 0) {
                const element = elements[0];
                const datasetLabel = chart.data.datasets[element.datasetIndex].label;
                if (datasetLabel === 'Ausentes') {
                    const index = element.index;
                    const fechaSeleccionada = dataGraficoSemanal.labels[index];
                    const registroDia = dataOriginal.find(r => r.fecha === fechaSeleccionada);
                    if (registroDia && registroDia.empleados) {
                        const listaCompletaAusentes = registroDia.empleados
                            .filter(empleado => empleado.estado === 'Ausente')
                            .map(empleado => empleado.nombre);
                        import('sweetalert2').then(Swal => {
                            Swal.default.fire({
                                title: `Ausentes del ${fechaSeleccionada}`,
                                html: `<ul style="text-align: left;">${listaCompletaAusentes.map(nombre => `<li>${nombre}</li>`).join('')}</ul>`,
                                icon: 'info',
                                showCloseButton: true,
                                showConfirmButton: false,
                                backdrop: true,
                                customClass: {
                                    popup: 'animated fadeInDown faster'
                                }
                            });
                        });
                    }
                }
            }
        }
    };

    return (
        <div className="dashboard-asistencia">
            <div className="filtros-dashboard">
                <label htmlFor="sector"></label>
                <select id="sector" name="sector" value={filtros.sector} onChange={handleFiltroChange}>
                    <option value="">Todos los sectores</option>
                    {sectoresUnicos.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                    ))}
                </select>

                <label htmlFor="fecha"></label>
                <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={filtros.fecha}
                    onChange={handleFiltroChange}
                />
            </div>

            <div className="metricas-clave">
                <div className="widget grafico-hoy">
                    <div className="pie-chart-container">
                        <Pie data={dataGraficoHoy} options={optionsGraficoHoy} />
                    </div>
                </div>

                <div className="widget">
                    {asistenciaSemanal.length > 0 ? (
                        <div className="bar-chart-container">
                            <Bar
                                data={dataGraficoSemanal}
                                options={optionsGraficoSemanal}
                                onClick={(event, elements) => {
                                    if (
                                        elements.length > 0 &&
                                        dataGraficoSemanal.datasets[elements[0].datasetIndex].label === 'Ausentes'
                                    ) {
                                        const index = elements[0].index;
                                        const fechaSeleccionada = dataGraficoSemanal.labels[index];
                                        const registroDia = dataOriginal.find(r => r.fecha === fechaSeleccionada);

                                        if (registroDia && registroDia.empleados) {
                                            const listaCompletaAusentes = registroDia.empleados
                                                .filter(empleado => empleado.estado === 'Ausente')
                                                .map(empleado => empleado.nombre);

                                            import('sweetalert2').then(Swal => {
                                                Swal.default.fire({
                                                    title: `Ausentes del ${fechaSeleccionada}`,
                                                    html: `<ul style="text-align: left;">${listaCompletaAusentes.map(nombre => `<li>${nombre}</li>`).join('')}</ul>`,
                                                    icon: 'info',
                                                    showCloseButton: true,
                                                    showConfirmButton: false,
                                                    backdrop: true,
                                                    customClass: {
                                                        popup: 'animated fadeInDown faster'
                                                    }
                                                });
                                            });
                                        }
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <p>No hay datos de asistencia para la semana actual.</p>
                    )}
                </div>
                {mostrarPopupAusentes && (
                    <div className="popup-ausentes">
                        <h3>Ausentes en el día</h3>
                        <ul>
                            {ausentesDiaSeleccionado.map((nombre, i) => (
                                <li key={i}>{nombre}</li>
                            ))}
                        </ul>
                        <button onClick={() => setMostrarPopupAusentes(false)}>Cerrar</button>
                    </div>
                )}

                <div className="widget">
                    <h3>Empleados en Licencia</h3>
                    {licencias.length === 0 ? (
                        <p>No hay empleados con licencia en esta fecha.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Motivo</th>
                                    <th>Inicio</th>
                                    <th>Fin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {licencias.map((empleado, index) => (
                                    <tr key={index}>
                                        <td>{empleado.nombre}</td>
                                        <td>{empleado.motivo}</td>
                                        <td>{empleado.inicio}</td>
                                        <td>{empleado.fin}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardAsistencia;