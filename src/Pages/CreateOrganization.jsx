import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './CreateOrganization.css';

const CrearOrganizacion = () => {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaOrg, setNuevaOrg] = useState({
    nombre: '',
    razonSocial: '',
    cuit: '',
    direccion: '',
    tipoPlan: '',
    logo: ''
  });
  const [orgEditando, setOrgEditando] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [modoVista, setModoVista] = useState('tarjetas'); // 'tarjetas' o 'lista'

  useEffect(() => {
    setOrganizaciones([
      {
        id: 1,
        nombre: 'TechCorp',
        razonSocial: 'TechCorp S.A.',
        cuit: '30-12345678-9',
        direccion: 'Av. Siempre Viva 123',
        tipoPlan: 'Premium',
        estado: 'activa',
        logo: ''
      },
      {
        id: 2,
        nombre: 'SoftSolutions',
        razonSocial: 'SoftSolutions SRL',
        cuit: '30-87654321-0',
        direccion: 'Calle Falsa 456',
        tipoPlan: 'Básico',
        estado: 'inactiva',
        logo: ''
      }
    ]);
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
      setNuevaOrg({ ...nuevaOrg, logo: logoURL });
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

    if (orgEditando) {
      const actualizadas = organizaciones.map((org) =>
        org.id === orgEditando.id ? { ...orgEditando, ...nuevaOrg } : org
      );
      setOrganizaciones(actualizadas);
      Swal.fire('¡Actualizado!', 'Los datos han sido modificados.', 'success');
    } else {
      const nueva = { ...nuevaOrg, id: Date.now(), estado: 'activa' };
      setOrganizaciones([...organizaciones, nueva]);
      Swal.fire('¡Registrada!', 'La empresa ha sido creada con éxito.', 'success');
    }

    setNuevaOrg({ nombre: '', razonSocial: '', cuit: '', direccion: '', tipoPlan: '', logo: '' });
    setOrgEditando(null);
    setMostrarFormulario(false);
    setLogoPreview(null);
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

    setOrganizaciones(organizaciones.map(org =>
      org.id === id ? { ...org, estado: org.estado === 'activa' ? 'inactiva' : 'activa' } : org
    ));

    Swal.fire('¡Estado actualizado!', `La empresa fue ${nuevaAccion} correctamente.`, 'success');
  };

  const handleEditar = (org) => {
    setNuevaOrg({
      nombre: org.nombre,
      razonSocial: org.razonSocial,
      cuit: org.cuit,
      direccion: org.direccion,
      tipoPlan: org.tipoPlan,
      logo: org.logo || ''
    });
    setLogoPreview(org.logo || null);
    setOrgEditando(org);
    setMostrarFormulario(true);
  };

  return (
    <div className="organizaciones-home">
      <div className="aura-label">✨Aura✨</div>
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
              <p><strong>Estado:</strong> {org.estado}</p>
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
              <option value="Básico">Básico</option>
              <option value="Estándar">Estándar</option>
              <option value="Premium">Premium</option>
            </select>
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
