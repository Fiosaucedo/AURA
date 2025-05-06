import React, { useEffect, useState } from 'react';
import './ViewAdmin.css';


const ViewAdmin = () => {
  const [empleados, setEmpleados] = useState([]);
  const [filtros, setFiltros] = useState({
    nombre: '',
    puesto: '',
    estado: ''
  });
  const [vista, setVista] = useState('grilla');
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    fetch('/empleados.json')
      .then(res => res.json())
      .then(data => setEmpleados(data))
      .catch(err => console.error('Error al cargar empleados:', err));
  }, []);

  const puestosUnicos = [...new Set(empleados.map(e => e.puesto))];

  const empleadosFiltrados = empleados.filter(e => {
    const matchNombre = e.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
    const matchPuesto = filtros.puesto ? e.puesto === filtros.puesto : true;
    const matchEstado = filtros.estado ? e.estado === filtros.estado : true;
    return matchNombre && matchPuesto && matchEstado;
  });

  const handleFiltroChange = e => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
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
          window.location.href = '/login';
        }
      });
    };

  return (
    <div className="employee-admin">
    <header className="header">
        <nav className="nav-bar">
          <div className="logo-logged">
            {adminUser?.organization_logo && (
              <img src={`https://aura-back-3h9b.onrender.com/${adminUser.organization_logo}`} alt="Logo" height="30" style={{ marginRight: "10px" }} />
            )}
            ✨Aura✨
          </div>
          <div className="admin-info">
            <span>{adminUser?.organization_name}</span>
            <span style={{ marginLeft: '10px' }}>{adminUser?.email}</span>
          </div>
          <button className="logout-button" onClick={handleLogout} title="Cerrar sesión">
            Cerrar Sesión
          </button>
        </nav>
      </header>
    
    <main>
      <h1>Administración de Empleados</h1>

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar por nombre"
          name="nombre"
          value={filtros.nombre}
          onChange={handleFiltroChange}
        />
        <select name="puesto" value={filtros.puesto} onChange={handleFiltroChange}>
          <option value="">Todos los puestos</option>
          {puestosUnicos.map((p, idx) => (
            <option key={idx} value={p}>{p}</option>
          ))}
        </select>
        <select name="estado" value={filtros.estado} onChange={handleFiltroChange}>
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <button onClick={() => setVista(vista === 'grilla' ? 'tarjetas' : 'grilla')}>
          Cambiar a vista {vista === 'grilla' ? 'tarjetas' : 'grilla'}
        </button>
      </div>

      {vista === 'grilla' ? (
        <table className="tabla-empleados">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Puesto</th>
              <th>Email</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {empleadosFiltrados.map(e => (
              <tr key={e.id}>
                <td>{e.nombre}</td>
                <td>{e.puesto}</td>
                <td>{e.email}</td>
                <td>
                  <span className={`estado ${e.estado}`}>{e.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="tarjetas-container">
          {empleadosFiltrados.map(e => (
            <div key={e.id} className="tarjeta-empleado">
              <h3>{e.nombre}</h3>
              <p><strong>Puesto:</strong> {e.puesto}</p>
              <p><strong>Email:</strong> {e.email}</p>
              <p><strong>Estado:</strong> <span className={`estado ${e.estado}`}>{e.estado}</span></p>
            </div>
          ))}
        </div>
      )}
      </main>
    </div>
  );
};

export default ViewAdmin;
