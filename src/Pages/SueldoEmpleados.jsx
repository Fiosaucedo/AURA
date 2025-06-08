import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './SueldoEmpleados.css';

const SueldoEmpleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [sueldos, setSueldos] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    // Obtenemos la fecha actual
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // getMonth() es 0-indexado (0 para enero, 4 para mayo)

    // Array de nombres de meses para una mejor visualización
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const currentMonthName = monthNames[month];

    useEffect(() => {
        const fetchEmpleados = async () => {
            try {
                const res = await fetch(`${API_URL}/employees`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setEmpleados(data);
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'No se pudieron cargar los empleados.', 'error');
            }
        };
        fetchEmpleados();
    }, [API_URL, token]); // Agregamos API_URL y token como dependencias

    useEffect(() => {
        // Solo calculamos sueldos si ya tenemos empleados y no estamos cargando
        if (empleados.length > 0 && !loading) {
            calcularSueldos();
        }
    }, [empleados]); // Se ejecuta cuando los empleados se cargan o cambian

    const calcularSueldos = async () => {
        setLoading(true);
        const results = [];
        // Usamos month + 1 porque la API probablemente espera el número de mes normal (1-12)
        const apiMonth = month + 1; 

        for (const emp of empleados) {
            try {
                const res = await fetch(`${API_URL}/salary/${emp.id}/${year}/${apiMonth}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    results.push({ ...emp, ...data });
                } else {
                    results.push({ ...emp, final_salary: 0, error: data.error || 'Error al calcular' });
                }
            } catch (err) {
                console.error(`Error calculando sueldo para ${emp.name}:`, err);
                results.push({ ...emp, final_salary: 0, error: 'Error de conexión' });
            }
        }
        setSueldos(results);
        setLoading(false);
    };

    return(
        <div className="sueldos-container">
           
            <h2>Sueldos - Cálculo al Día de la Fecha - {currentMonthName} de {year}</h2>

            {loading && (
                <div className="loading-sueldos">
                    <div className="spinner"></div>
                    Calculando sueldos...
                </div>
            )}

            {!loading && sueldos.length > 0 && (
                <button onClick={calcularSueldos} className="update-button">
                    Actualizar Datos
                </button>
            )}

            {sueldos.length > 0 && (
                <table className="sueldo-table">
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            <th>Sueldo base</th>
                            <th>Días trabajados</th>
                            <th>Días justificados</th>
                            <th>Días faltados</th>
                            <th>Sueldo final</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sueldos.map((s, i) => (
                            <tr key={i}>
                                <td>{s.name}</td>
                                <td>${s.base_salary?.toLocaleString('es-AR') ?? "N/A"}</td> {/* Formato de moneda */}
                                <td>{s.present_days ?? "-"}</td>
                                <td>{s.justified_days ?? "-"}</td>
                                <td>{s.missed_days ?? "-"}</td>
                                <td>${s.final_salary?.toLocaleString('es-AR') ?? 0}</td> {/* Formato de moneda */}
                                <td>{s.error ? `⚠️ ${s.error}` : "✅ OK"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {!loading && empleados.length === 0 && sueldos.length === 0 && (
                <p className="no-data-message">No hay empleados para calcular sueldos.</p>
            )}
        </div>
    )
};

export default SueldoEmpleados;