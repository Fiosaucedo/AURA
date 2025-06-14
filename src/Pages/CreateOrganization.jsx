import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './CreateOrganization.css';
import Header from '../components/Header'; 

const CrearOrganizacion = () => {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaOrg, setNuevaOrg] = useState({
    nombre: '',
    razonSocial: '',
    cuit: '',
    direccion: '',
    tipoPlan: '',
    logo: '',
    emailContacto: ''
  });
  const [orgEditando, setOrgEditando] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [modoVista, setModoVista] = useState('tarjetas');
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null); 
  

  const API_URL = import.meta.env.VITE_API_URL; 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión no iniciada',
        text: 'Debés iniciar sesión como administrador.',
        confirmButtonText: 'Ir al login'
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    const checkAndFetch = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, { 
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok || data.role !== 'admin') {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'Solo los administradores pueden acceder a esta sección.',
            confirmButtonText: 'Ir al login'
          }).then(() => {
            navigate("/login");
          });
          return;
        }
        setAdminUser(data); 

        const orgRes = await fetch(`${API_URL}/organizations`, { 
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const orgData = await orgRes.json();
        if (orgRes.ok) {
          const mapped = orgData.map(org => ({
            id: org.id,
            nombre: org.name,
            razonSocial: org.companyName,
            cuit: org.cuit,
            direccion: org.address,
            tipoPlan: org.planType,
            estado: org.isActive === true ? 'activa' : 'inactiva',
            logo: org.logo ? `${API_URL}/${org.logo}` : ''
          }));
          setOrganizaciones(mapped);
        } else {
          Swal.fire('Error', orgData.message || 'No se pudieron cargar las organizaciones.', 'error');
        }

      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Error de red al validar el usuario.', 'error');
        navigate("/login");
      }
    };

    checkAndFetch();
  }, []);


  const toggleFormulario = () => {
    setMostrarFormulario(!mostrarFormulario);
    setOrgEditando(null);
    setNuevaOrg({ nombre: '', razonSocial: '', cuit: '', direccion: '', tipoPlan: '', logo: '' });
    setLogoPreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaOrg({ ...nuevaOrg, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const logoURL = URL.createObjectURL(file);
      setNuevaOrg({ ...nuevaOrg, logo: logoURL, logoFile: file });
      setLogoPreview(logoURL);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmacion = await Swal.fire({
      title: orgEditando ? '¿Guardar cambios?' : '¿Registrar empresa?',
      text: orgEditando
        ? 'Estás a punto de guardar los cambios en esta empresa.'
        : 'Estás a punto de registrar una nueva empresa.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    const formData = new FormData();
    formData.append("name", nuevaOrg.nombre);
    formData.append("companyName", nuevaOrg.razonSocial);
    formData.append("cuit", nuevaOrg.cuit);
    formData.append("address", nuevaOrg.direccion);
    formData.append("planId", nuevaOrg.tipoPlan);
    if (nuevaOrg.logoFile) {
      formData.append("logo", nuevaOrg.logoFile);
    }
    formData.append("contactEmail", nuevaOrg.emailContacto);

    try {
      const url = orgEditando
        ? `${API_URL}/organizations/${orgEditando.id}` // Usar API_URL aquí
        : `${API_URL}/organizations`; // Usar API_URL aquí

      const method = orgEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        if (orgEditando) {
          setOrganizaciones(prev =>
            prev.map(org =>
              org.id === orgEditando.id
                ? { ...org, ...nuevaOrg, logo: nuevaOrg.logo || org.logo }
                : org
            )
          );
          Swal.fire('¡Actualizado!', 'Los datos han sido modificados.', 'success');
        } else {
          const nuevaEmpresa = {
            id: data.organizationId,
            nombre: nuevaOrg.nombre,
            razonSocial: nuevaOrg.razonSocial,
            cuit: nuevaOrg.cuit,
            direccion: nuevaOrg.direccion,
            tipoPlan: nuevaOrg.tipoPlan,
            estado: true,
            logo: nuevaOrg.logoFile ? `${API_URL}/files/img/${nuevaOrg.logoFile.name}` : '' // Usar API_URL aquí
          };
          setOrganizaciones(prev => [...prev, nuevaEmpresa]);
          Swal.fire('¡Registrada!', 'La empresa ha sido creada con éxito.', 'success');
        }

        toggleFormulario();
      } else {
        Swal.fire('Error', data.message || 'No se pudo procesar la solicitud.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Ocurrió un error inesperado.', 'error');
    }
  };

  const cambiarEstado = async (id) => {
    const empresa = organizaciones.find((org) => org.id === id);
    const nuevaAccion = empresa.estado === 'activa' ? 'inactivar' : 'activar';

    const confirmacion = await Swal.fire({
      title: `¿Deseas ${nuevaAccion} la empresa?`,
      text: `Empresa: ${empresa.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${nuevaAccion}`,
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/organizations/${id}/toggle-status`, { // Usar API_URL aquí
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setOrganizaciones(prev =>
          prev.map(org =>
            org.id === id ? { ...org, estado: org.estado === 'activa' ? 'inactiva' : 'activa' } : org
          )
        );
        Swal.fire('¡Estado actualizado!', `La empresa fue ${nuevaAccion} correctamente.`, 'success');
      } else {
        Swal.fire('Error', data.message || 'No se pudo actualizar el estado.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error al cambiar estado.', 'error');
    }
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

  const handleEditar = (org) => {
    setNuevaOrg({
      nombre: org.nombre,
      razonSocial: org.razonSocial,
      cuit: org.cuit,
      direccion: org.direccion,
      tipoPlan: org.tipoPlan,
      logo: org.logo || '',
      emailContacto: org.emailContacto || ''
    });
    setLogoPreview(org.logo || null);
    setOrgEditando(org);
    setMostrarFormulario(true);
  };

  return (
    <div className="organizaciones-home">
    
      <Header adminUser={adminUser} onLogout={handleLogout} VITE_API_URL={API_URL} />
      <h2 className="titulo">Empresas registradas</h2>
      <div className="botones-superiores">
        <button className="boton-crear" onClick={toggleFormulario}>
          {mostrarFormulario ? 'Cancelar' : '➕ Crear nueva empresa'}
        </button>
        {!mostrarFormulario && (<button
          className="boton-vista" onClick={() => setModoVista(modoVista === 'tarjetas' ? 'lista' : 'tarjetas')}>
          🔄️
        </button>
        )}
      </div>

      {!mostrarFormulario && modoVista === 'tarjetas' && (
        <div className="lista-organizaciones">
          {organizaciones.map((org) => (
            <div key={org.id} className={`org-card ${org.estado === 'inactiva' ? 'inactiva' : ''}`}>
              <h4>{org.nombre}</h4>
              <p><strong>Razón Social:</strong> {org.razonSocial}</p>
              <p><strong>CUIT:</strong> {org.cuit}</p>
              <p><strong>Dirección:</strong> {org.direccion}</p>
              <p><strong>Plan:</strong> {org.tipoPlan}</p>
              <p><strong>Estado:</strong> {org.estado === 'activa' ? 'activa' : 'inactiva'}</p>
              {org.logo && <img src={org.logo} alt="Logo" style={{ width: '100px', marginTop: '10px' }} />}
              <div className="botones-org">
                <button className="boton-editar" onClick={() => handleEditar(org)}>Editar</button>
                {org.estado === 'activa' ? (
                  <button className="boton-inactivar" onClick={() => cambiarEstado(org.id)}>Inactivar</button>
                ) : (
                  <button className="boton-activar" onClick={() => cambiarEstado(org.id)}>Activar</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!mostrarFormulario && modoVista === 'lista' && (
        <div className="tabla-organizaciones">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Razón Social</th>
                <th>CUIT</th>
                <th>Dirección</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Logo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {organizaciones.map((org) => (
                <tr key={org.id} className={org.estado === 'inactiva' ? 'inactiva' : ''}>
                  <td>{org.nombre}</td>
                  <td>{org.razonSocial}</td>
                  <td>{org.cuit}</td>
                  <td>{org.direccion}</td>
                  <td>{org.tipoPlan}</td>
                  <td>{org.estado}</td>
                  <td>{org.logo ? <img src={org.logo} alt="Logo" width="60" /> : '-'}</td>
                  <td>
                    <button className='boton-editar-lista' onClick={() => handleEditar(org)}>Editar</button>{' '}
                    <button className={`boton-cambiar-estado-lista ${org.estado === 'activa' ? 'inactivar' : 'activar'}`}
                      onClick={() => cambiarEstado(org.id)}
                    >
                      {org.estado === 'activa' ? 'Inactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mostrarFormulario && (
        <div className="formulario-container activo">
          <form className="formulario-org" onSubmit={handleSubmit}>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre de la empresa"
              value={nuevaOrg.nombre}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="razonSocial"
              placeholder="Razón Social"
              value={nuevaOrg.razonSocial}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="cuit"
              placeholder="CUIT"
              value={nuevaOrg.cuit}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              value={nuevaOrg.direccion}
              onChange={handleChange}
              required
            />
            <select
              name="tipoPlan"
              value={nuevaOrg.tipoPlan}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar plan</option>
              <option value="1">AURA Start</option>
              <option value="2">AURA Pro</option>
            </select>
            <input
              type="email"
              name="emailContacto"
              placeholder="Email de contacto"
              value={nuevaOrg.emailContacto}
              onChange={handleChange}
              required
            />
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {logoPreview && <img src={logoPreview} alt="Vista previa" style={{ width: '120px' }} />}
            <button type="submit">{orgEditando ? 'Guardar cambios' : 'Registrar empresa'}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CrearOrganizacion;