import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './SueldoEmpleados.css';

const SueldoEmpleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [sueldos, setSueldos] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

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
            }
        };
        fetchEmpleados();
    }, []);

    const calcularSueldos = async () => {
        setLoading(true);
        const results = [];
        for (const emp of empleados) {
            try {
                const res = await fetch(`${API_URL}/salary/${emp.id}/${year}/${month}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    results.push({ ...emp, ...data });
                } else {
                    results.push({ ...emp, final_salary: 0, error: data.error });
                }
            } catch (err) {
                console.error(err);
            }
        }
        setSueldos(results);
        setLoading(false);
    };

    return (
        <div className="sueldos-container">
            <h2>Sueldos de empleados - {month}/{year}</h2>
            <button onClick={calcularSueldos} disabled={loading}>
                {loading ? "Calculando..." : "Calcular sueldos"}
            </button>
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
                                <td>${s.base_salary ?? "N/A"}</td>
                                <td>{s.present_days ?? "-"}</td>
                                <td>{s.justified_days ?? "-"}</td>
                                <td>{s.missed_days ?? "-"}</td>
                                <td>${s.final_salary ?? 0}</td>
                                <td>{s.error ? `⚠️ ${s.error}` : "✅ OK"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default SueldoEmpleados;
