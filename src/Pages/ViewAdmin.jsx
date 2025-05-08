import React, { useEffect, useState } from 'react';
import './ViewAdmin.css';
import Swal from "sweetalert2";


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


    const abrirPopup = (empleado) => {
      Swal.fire({
        title: `Datos del empleado`,
        customClass: {
          popup: 'mi-swal-popup',
        },
        showCloseButton: true,
        html: `
          <div class="formContainer">
            <div class="column-left">
              <div class="campo">
                <label>Nombre</label>
                <p id="nombreTexto">${empleado.nombre}</p>
              </div>
              <div class="campo">
                <label>Puesto</label>
                <p id="puestoTexto">${empleado.puesto}</p>
              </div>
              <div class="campo">
                <label>Email</label>
                <p id="emailTexto">${empleado.email}</p>
              </div>
              <div class="campo">
                <label>Estado</label>
                <p id="estadoTexto">${empleado.estado}</p>
              </div>
            </div>
            <div class="column-right">
              <div class="campo">
                <label>DNI</label>
                <p id="dniTexto">${empleado.dni}</p>
              </div>
              <div class="campo">
                <label>Teléfono</label>
                <p id="telefonoTexto">${empleado.telefono}</p>
              </div>
              <div class="campo">
                <label>Dirección</label>
                <p id="direccionTexto">${empleado.direccion}</p>
              </div>
               </div>
  </div>
  <div style="text-align: center; margin-top: 15px;">
    <button id="editarBtn" title="Editar">✏️ Editar</button>
  </div>
        `,
        showCancelButton: false,
        showConfirmButton: false, 
        preConfirm: () => {
          const nombreInput = document.getElementById("nombreInput");
          const puestoInput = document.getElementById("puestoInput");
          const emailInput = document.getElementById("emailInput");
          const estadoInput = document.getElementById("estadoInput");
          const dniInput = document.getElementById("dniInput");
          const telefonoInput = document.getElementById("telefonoInput");
          const direccionInput = document.getElementById("direccionInput");
    
          if (!nombreInput || !puestoInput || !emailInput || !estadoInput || !dniInput || !telefonoInput || !direccionInput) {
            Swal.showValidationMessage("Primero tenés que apretar ✏️ para editar.");
            return false;
          }
    
          const nombre = nombreInput.value;
          const puesto = puestoInput.value;
          const email = emailInput.value;
          const estado = estadoInput.value;
          const dni = dniInput.value;
          const telefono = telefonoInput.value;
          const direccion = direccionInput.value;
    
          const cambiosRealizados = (
            empleado.nombre !== nombre ||
            empleado.puesto !== puesto ||
            empleado.email !== email ||
            empleado.estado !== estado ||
            empleado.dni !== dni ||
            empleado.telefono !== telefono ||
            empleado.direccion !== direccion
          );
    
          if (!cambiosRealizados) {
            Swal.showValidationMessage("No se hicieron cambios.");
            return false;
          }
    
          return { ...empleado, nombre, puesto, email, estado, dni, telefono, direccion };
        },
        didOpen: () => {
          let modoEdicion = false;
    
          const editarBtn = document.getElementById("editarBtn");
          editarBtn.addEventListener("click", () => {
            if (!modoEdicion) {
              // Convertir todos los campos a inputs
              document.getElementById("nombreTexto").outerHTML = `<input id="nombreInput" class="swal2-input" value="${empleado.nombre}">`;
              document.getElementById("puestoTexto").outerHTML = `<input id="puestoInput" class="swal2-input" value="${empleado.puesto}">`;
              document.getElementById("emailTexto").outerHTML = `<input id="emailInput" class="swal2-input" value="${empleado.email}">`;
              document.getElementById("estadoTexto").outerHTML = `
                <select id="estadoInput" class="swal2-input">
                  <option value="activo" ${empleado.estado === "activo" ? "selected" : ""}>Activo</option>
                  <option value="inactivo" ${empleado.estado === "inactivo" ? "selected" : ""}>Inactivo</option>
                </select>
              `;
              document.getElementById("dniTexto").outerHTML = `<input id="dniInput" class="swal2-input" value="${empleado.dni}">`;
              document.getElementById("telefonoTexto").outerHTML = `<input id="telefonoInput" class="swal2-input" value="${empleado.telefono}">`;
              document.getElementById("direccionTexto").outerHTML = `<input id="direccionInput" class="swal2-input" value="${empleado.direccion}">`;
    
              editarBtn.textContent = "💾 Guardar cambios";
              modoEdicion = true;
            } else {
              Swal.clickConfirm(); // dispara preConfirm
            }
          });
        }
      }).then(result => {
        if (result.isConfirmed && result.value) {
          const actualizados = empleados.map(emp =>
            emp.id === result.value.id ? result.value : emp
          );
          setEmpleados(actualizados);
          Swal.fire("Guardado", "Los cambios fueron guardados.", "success");
        }
      });
    };

    const abrirPopupAgregarEmpleado = () => {
      Swal.fire({
        title: 'Agregar Nuevo Empleado',
        customClass: {
          popup: 'mi-swal-popup',
        },
        showCloseButton: true,
        html: `
          <div class="formContainer">
            <div class="column-left">
              <div class="campo">
                <label>Nombre</label>
                <input id="nombreInput" class="swal2-input" value="">
              </div>
              <div class="campo">
                <label>Puesto</label>
                <input id="puestoInput" class="swal2-input" value="">
              </div>
              <div class="campo">
                <label>Email</label>
                <input id="emailInput" class="swal2-input" value="">
              </div>
              <div class="campo">
                <label>Estado</label>
                <select id="estadoInput" class="swal2-input">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div class="column-right">
              <div class="campo">
                <label>DNI</label>
                <input id="dniInput" class="swal2-input" value="">
              </div>
              <div class="campo">
                <label>Teléfono</label>
                <input id="telefonoInput" class="swal2-input" value="">
              </div>
              <div class="campo">
                <label>Dirección</label>
                <input id="direccionInput" class="swal2-input" value="">
              </div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Agregar Empleado',
        preConfirm: () => {
          const nombre = document.getElementById("nombreInput").value;
          const puesto = document.getElementById("puestoInput").value;
          const email = document.getElementById("emailInput").value;
          const estado = document.getElementById("estadoInput").value;
          const dni = document.getElementById("dniInput").value;
          const telefono = document.getElementById("telefonoInput").value;
          const direccion = document.getElementById("direccionInput").value;
    
          if (!nombre || !puesto || !email || !estado || !dni || !telefono || !direccion) {
            Swal.showValidationMessage("Por favor, completa todos los campos.");
            return false;
          }
    
          return { nombre, puesto, email, estado, dni, telefono, direccion };
        }
      }).then(result => {
        if (result.isConfirmed && result.value) {
          const nuevoEmpleado = { id: Date.now(), ...result.value }; // Simulación de ID
          setEmpleados([...empleados, nuevoEmpleado]);
          Swal.fire("Agregado", "El empleado fue agregado.", "success");
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
          <div className="filtros-izquierda">
            <button onClick={abrirPopupAgregarEmpleado}>Agregar Empleado</button>
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
          </div>
          <div className="filtros-derecha">
            <button onClick={() => setVista(vista === 'grilla' ? 'tarjetas' : 'grilla')}>
              Cambiar a vista {vista === 'grilla' ? 'tarjetas' : 'grilla'}
            </button>
          </div>
        </div>

      {vista === 'grilla' ? (
        <table className="tabla-empleados">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Puesto</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acciones</th>
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
                <td>
                  <button onClick={() => abrirPopup(e)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="tarjetas-container">
          {empleadosFiltrados.map(e => (
            <div key={e.id} className="tarjeta-empleado" onClick={() => abrirPopup(e)}>
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
