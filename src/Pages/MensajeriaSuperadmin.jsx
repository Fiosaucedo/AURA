import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import './MensajeriaSuperadmin.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; 

const MensajeriaSuperadmin = () => { 
    const [mensajes, setMensajes] = useState([]);
    const [adminUser, setAdminUser] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL; 
    const navigate = useNavigate(); 


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

          
                if (rol !== 'admin') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Acceso denegado',
                        text: 'No tenés permiso para acceder a esta sección. Solo Superadmin puede ver los mensajes.',
                    }).then(() => {
                        navigate("/home"); 
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
       
        if (adminUser && adminUser.role === 'admin') {
            fetchMensajes();
        }
    }, [adminUser, API_URL]); 

    const fetchMensajes = async () => {
        try {
            const token = localStorage.getItem("token"); 
            const response = await fetch(`${API_URL}/contacto`, { 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });
            if (!response.ok) {
               
                if (response.status === 401 || response.status === 403) {
                     Swal.fire('Error de Acceso', 'No tienes permiso para ver estos mensajes o tu sesión ha expirado.', 'error');
                     localStorage.removeItem('token');
                     navigate('/login');
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();
            setMensajes(data);
        } catch (error) {
            console.error('Error al obtener los mensajes de contacto:', error);
            setMensajes([]); 
        }
    };

    return (
        <div className="mensajeria-superadmin">
      
            <Header
                adminUser={adminUser}
                API_URL={API_URL}
                onLogout={handleLogout}
            />

            <main className="mensajeria-contenido">
                <h1>📨 Sugerencias y Reclamos Recibidos</h1>

                {mensajes.length === 0 ? (
                    <p className="no-mensajes">No hay mensajes por el momento.</p>
                ) : (
                    <div className="tarjetas-mensajes">
                        {mensajes.map((msg, idx) => (
                            <div className="tarjeta-mensaje" key={idx}>
                                <div className="cabecera-tarjeta">
                                    <span className="tipo-usuario">🧑 {msg.userType}</span>
                                    <span className="motivo-contacto">📌 {msg.reason}</span>
                                </div>
                                <h3>{msg.name}</h3>
                                <p><strong>Email:</strong> {msg.email}</p>
                                <p><strong>Teléfono:</strong> {msg.phone}</p>
                                <p className="mensaje-texto">"{msg.message}"</p>
                                <p className="fecha-recibido">📅 {new Date(msg.created_at).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MensajeriaSuperadmin;