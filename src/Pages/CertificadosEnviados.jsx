import React, { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import Header from '../components/Header.jsx';
import './CertificadosEnviados.css';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, LayoutList, CheckCircle2, XCircle, FileText } from 'lucide-react';

const CertificadosEnviados = () => {
    const [certificados, setCertificados] = useState([]);
    const [vistaCertificados, setVistaCertificados] = useState('tarjetas');
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const VITE_API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [filtroMotivo, setFiltroMotivo] = useState('Todos');
    const [filtroFecha, setFiltroFecha] = useState('');

    const motivosDisponibles = useMemo(() => {
        const uniqueMotivos = [...new Set(certificados.map(c => c.reason).filter(Boolean))];
        return ['Todos', ...uniqueMotivos.sort()];
    }, [certificados]);

    useEffect(() => {
        const validateUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const res = await fetch(`${VITE_API_URL}/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();

                if (!res.ok || !['supervisor', 'admin'].includes(data.role)) {
                    Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tenés permiso.' })
                        .then(() => navigate("/login"));
                    return;
                }
                setAdminUser(data);
            } catch (err) {
                console.error("Error validating user:", err);
                Swal.fire({ icon: 'error', title: 'Error de autenticación', text: 'Hubo un problema al verificar tu sesión.' })
                    .then(() => navigate("/login"));
            }
        };
        validateUser();
    }, [navigate, VITE_API_URL]);

    useEffect(() => {
        const fetchCertificados = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                Authorization: token ? `Bearer ${token}` : '',
            };

            try {
                const res = await fetch(`${VITE_API_URL}/certificates`, { headers });
                const data = await res.json();

                if (res.ok && Array.isArray(data)) {
                    const sortedData = data.sort((a, b) => {
                        const dateA = new Date(a.created_at || a.issue_date || a.start_date);
                        const dateB = new Date(b.created_at || b.issue_date || b.start_date);
                        return dateB.getTime() - dateA.getTime();
                    });
                    setCertificados(sortedData);
                } else {
                    console.warn("Respuesta inesperada al cargar certificados:", data);
                    setCertificados([]);
                }
            } catch (err) {
                console.error("Error al cargar certificados:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al cargar certificados.',
                });
                setCertificados([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificados();
    }, [VITE_API_URL]);


    const verArchivo = (filePath) => {
        const url = `${VITE_API_URL}/${filePath}`;
        window.open(url, '_blank');
    };

    const aprobarCertificado = (id) => {
        Swal.fire({
            title: '¿Confirmar aprobación?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, aprobar',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                try {
                    const res = await fetch(`${VITE_API_URL}/certificates/approve/${id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ comment: 'Aprobado por el supervisor.' }),
                    });

                    if (res.ok) {
                        Swal.fire({ icon: 'success', title: 'Certificado aprobado' });
                        actualizarEstadoCertificado(id, 'Aprobado', 'Aprobado por el supervisor.');
                    } else {
                        const errorData = await res.json();
                        Swal.fire({ icon: 'error', title: 'Error', text: errorData.message || 'No se pudo aprobar el certificado.' });
                    }
                } catch (error) {
                    console.error("Error al aprobar certificado:", error);
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema de red al aprobar.' });
                }
            }
        });
    };

    const rechazarCertificado = (id) => {
        Swal.fire({
            title: '¿Confirmar rechazo?',
            icon: 'warning',
            input: 'textarea',
            inputLabel: 'Motivo del rechazo',
            inputPlaceholder: 'Escribe el motivo aquí...',
            showCancelButton: true,
            confirmButtonText: 'Rechazar',
            cancelButtonText: 'Cancelar',
            preConfirm: (comentario) => {
                if (!comentario) {
                    Swal.showValidationMessage('El motivo es obligatorio');
                }
                return comentario;
            },
        }).then(async (result) => {
            const comentario = result.value;
            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                try {
                    const res = await fetch(`${VITE_API_URL}/certificates/reject/${id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ comment: comentario }),
                    });

                    if (res.ok) {
                        Swal.fire('Rechazado', 'El certificado ha sido rechazado.', 'success');
                        actualizarEstadoCertificado(id, 'Rechazado', comentario);
                    } else {
                        const errorData = await res.json();
                        Swal.fire({ icon: 'error', title: 'Error', text: errorData.message || 'No se pudo rechazar el certificado.' });
                    }
                } catch (error) {
                    console.error("Error al rechazar certificado:", error);
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema de red al rechazar.' });
                }
            }
        });
    };

    const actualizarEstadoCertificado = (id, nuevoEstado, nuevoComentario) => {
        setCertificados(prev =>
            prev.map(c =>
                c.id === id
                    ? { ...c, last_state: nuevoEstado, last_comment: nuevoComentario }
                    : c
            )
        );
    };

    const estaEvaluado = (estado) => {
        return estado === 'Aprobado' || estado === 'Rechazado';
    };

    const iconoEstado = (estado) => {
        if (estado === 'Aprobado') return '✅';
        if (estado === 'Rechazado') return '❌';
        return '⏳';
    };

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

    const certificadosFiltrados = useMemo(() => {
        let filtrados = certificados;

        if (filtroEstado !== 'Todos') {
            filtrados = filtrados.filter(cert =>
                cert.last_state && cert.last_state.toUpperCase() === filtroEstado.toUpperCase()
            );
        }

        if (filtroMotivo !== 'Todos') {
            filtrados = filtrados.filter(cert =>
                cert.reason && cert.reason.toUpperCase() === filtroMotivo.toUpperCase()
            );
        }

        if (filtroFecha) {
            const fechaSeleccionada = new Date(filtroFecha + 'T00:00:00');
            filtrados = filtrados.filter(cert => {
                const fechaInicio = new Date(cert.start_date + 'T00:00:00');
                const fechaFin = new Date(cert.end_date + 'T00:00:00');
                return fechaSeleccionada >= fechaInicio && fechaSeleccionada <= fechaFin;
            });
        }
        return filtrados;
    }, [certificados, filtroEstado, filtroMotivo, filtroFecha]);


    return (
        <div className="certificados-container">
            <Header adminUser={adminUser} onLogout={handleLogout} VITE_API_URL={VITE_API_URL} />

            <div className="certificados-content">
                <div className="certificados-header">
                    <h2 className="certificados-title">Gestión de Certificados</h2>
                    <div className="filters-and-view-toggle">

                        <div className="filters-group">

                            <div className="filter-item">
                                <label htmlFor="filter-estado">Estado:</label>
                                <select
                                    id="filter-estado"
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                >
                                    <option value="Todos">Todos</option>
                                    <option value="CARGADO">Pendiente de Revisión</option>
                                    <option value="APROBADO">Aprobado</option>
                                    <option value="RECHAZADO">Rechazado</option>
                                </select>
                            </div>

                            <div className="filter-item">
                                <label htmlFor="filter-motivo">Motivo:</label>
                                <select
                                    id="filter-motivo"
                                    value={filtroMotivo}
                                    onChange={(e) => setFiltroMotivo(e.target.value)}
                                >
                                    {motivosDisponibles.map((mot) => (
                                        <option key={mot} value={mot}>{mot}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-item">
                                <label htmlFor="filter-fecha">Fecha que cubre:</label>
                                <input
                                    id="filter-fecha"
                                    type="date"
                                    value={filtroFecha}
                                    onChange={(e) => setFiltroFecha(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setVistaCertificados(vistaCertificados === 'lista' ? 'tarjetas' : 'lista')}
                            title={vistaCertificados === 'lista' ? 'Cambiar a vista de tarjetas' : 'Cambiar a vista de lista'}
                            className="toggle-view-button"
                        >
                            {vistaCertificados === 'lista' ? <LayoutGrid size={24} /> : <LayoutList size={24} />}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="spinner-container">
                        <div className="spinner"></div>
                        <p>Cargando certificados...</p>
                    </div>
                ) : certificadosFiltrados.length === 0 ? (
                    <p className="no-certificados-message">No hay certificados para revisar con los filtros aplicados.</p>
                ) : vistaCertificados === 'tarjetas' ? (
                    <div className="certificados-tarjetas">
                        {certificadosFiltrados.map((c) => (
                            <div
                                key={c.id}
                                className={`certificado-card ${c.last_state === 'Aprobado' ? 'aprobado' : c.last_state === 'Rechazado' ? 'rechazado' : ''}`}
                            >
                                <h4>{c.employee_name}</h4>
                                <p><strong>Inicio de licencia:</strong> {new Date(c.start_date + 'T00:00:00').toLocaleDateString('es-AR')}</p>
                                <p><strong>Fin de licencia:</strong> {new Date(c.end_date + 'T00:00:00').toLocaleDateString('es-AR')}</p>
                                <p><strong>Motivo:</strong> {c.reason}</p>
                                <p><strong>Estado:</strong> {iconoEstado(c.last_state)} {c.last_state}</p>
                                <p><strong>Comentario:</strong> {c.last_comment}</p>
                                <div className="certificado-buttons">
                                    <button onClick={() => aprobarCertificado(c.id)} disabled={estaEvaluado(c.last_state)} className="button-aprobar"><CheckCircle2 size={24} /></button>
                                    <button onClick={() => rechazarCertificado(c.id)} disabled={estaEvaluado(c.last_state)} className="button-rechazar"><XCircle size={24} /></button>
                                    <button onClick={() => verArchivo(c.file_path)} className="button-ver-archivo"><FileText size={24} /> </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <table className="tabla-certificados" border="1">
                        <thead>
                            <tr>
                                <th>Empleado</th>
                                <th>Inicio de licencia</th>
                                <th>Fin de licencia</th>
                                <th>Motivo</th>
                                <th>Estado</th>
                                <th>Comentario</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificadosFiltrados.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.employee_name}</td>
                                    <td>{new Date(c.start_date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                                    <td>{new Date(c.end_date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                                    <td>{c.reason}</td>
                                    <td>{iconoEstado(c.last_state)} {c.last_state}</td>
                                    <td>{c.last_comment}</td>
                                    <td>
                                        <div className="top-buttons-group">
                                            <button
                                                onClick={() => aprobarCertificado(c.id)}
                                                disabled={estaEvaluado(c.last_state)}
                                                className="button-aprobar"
                                            >
                                                <CheckCircle2 size={24} />
                                            </button>
                                            <button
                                                onClick={() => rechazarCertificado(c.id)}
                                                disabled={estaEvaluado(c.last_state)}
                                                className="button-rechazar"
                                            >
                                                <XCircle size={24} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => verArchivo(c.file_path)}
                                            className="button-ver-archivo"
                                        >
                                            <FileText size={24} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CertificadosEnviados;