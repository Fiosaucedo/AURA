import React, { useEffect, useState } from 'react';
import './ViewAdmin.css';
import Swal from "sweetalert2";
import { LayoutGrid, LayoutList, UserPlus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const ViewAdmin = () => {
  const [empleados, setEmpleados] = useState([]);
  const [filtros, setFiltros] = useState({
    nombre: '',
    rol: '',
    puesto: '',
    estado: ''
  });
  const [vista, setVista] = useState('grilla');
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        title: 'Debes iniciar sesión',
        text: 'Por favor iniciá sesión para acceder a esta sección.',
        icon: 'error',
        confirmButtonText: 'Ir al login'
      }).then(() => {
        window.location.href = '/login';
      });
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();


        const rol = data.role;

        if (!['admin'].includes(rol)) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No tenés permiso para acceder a esta sección.',
          }).then(() => {
            navigate("/login");
          });
        }

        setAdminUser(data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    const fetchAdminUser = async () => {
      try {
        const res = await fetch(`${VITE_API_URL}/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setAdminUser(data);
      } catch (err) {
        console.error("Error al obtener admin user:", err);
      }
    };

    const fetchEmpleados = async () => {
      try {
        const res = await fetch(`${VITE_API_URL}/employees`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setEmpleados(data);
      } catch (err) {
        console.error("Error al obtener empleados:", err);
      }
    };

    fetchAdminUser();
    fetchUser();
    fetchEmpleados();
  }, []);
  const rolesUnicos = [...new Set(empleados.map(e => e.role))];
  const puestosUnicos = [...new Set(empleados.map(e => e.position))];

  const empleadosFiltrados = empleados.filter(e => {
    const matchNombre = e.name.toLowerCase().includes(filtros.nombre.toLowerCase());
    const matchRol = filtros.rol ? e.role === filtros.rol : true;
    const matchPuesto = filtros.puesto ? e.position === filtros.puesto : true;
    const matchEstado = filtros.estado ? e.status === filtros.estado : true;
    return matchNombre && matchPuesto && matchRol && matchEstado;
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
                <p id="nombreTexto">${empleado.name}</p>
              </div>
              <div class="campo">
                <label>Rol</label>
                <p id="rolTexto">${empleado.role}</p>
              </div>
              <div class="campo">
                <label>Puesto</label>
                <p id="puestoTexto">${empleado.position}</p>
              </div>
              <div class="campo">
                <label>Email</label>
                <p id="emailTexto">${empleado.email}</p>
              </div>
              <div class="campo">
                <label>Estado</label>
                <p id="estadoTexto">${empleado.status}</p>
              </div>
            </div>
            <div class="column-right">
              <div class="campo">
                <label>DNI</label>
                <p id="dniTexto">${empleado.dni}</p>
              </div>
              <div class="campo">
                <label>Teléfono</label>
                <p id="telefonoTexto">${empleado.phone}</p>
              </div>
              <div class="campo">
                <label>Dirección</label>
                <p id="direccionTexto">${empleado.address}</p>
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
        const rolInput = document.getElementById("rolInput");
      
        if (!nombreInput || !puestoInput || !emailInput || !estadoInput || !dniInput || !telefonoInput || !direccionInput || !rolInput) {
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
        const rol = rolInput.value;
      
        const cambiosRealizados = (
          empleado.name !== nombre ||
          empleado.position !== puesto ||
          empleado.email !== email ||
          empleado.status !== estado ||
          empleado.dni !== dni ||
          empleado.phone !== telefono ||
          empleado.address !== direccion ||
          empleado.role !== rol
        );
      
        if (!cambiosRealizados) {
          Swal.showValidationMessage("No se hicieron cambios.");
          return false;
        }
      
        return {
          ...empleado,
          name: nombre,
          position: puesto,
          email: email,
          status: estado,
          dni: dni,
          phone: telefono,
          address: direccion,
          role: rol
        };
      },
      didOpen: () => {
        let modoEdicion = false;
      
        const editarBtn = document.getElementById("editarBtn");
        editarBtn.addEventListener("click", () => {
          if (!modoEdicion) {
            document.getElementById("nombreTexto").outerHTML = `<input id="nombreInput" class="swal2-input" value="${empleado.name}">`;
            document.getElementById("puestoTexto").outerHTML = `<input id="puestoInput" class="swal2-input" value="${empleado.position}">`;
            document.getElementById("rolTexto").outerHTML = `
              <select id="rolInput" class="swal2-input">
                <option value="employee" ${empleado.role === "employee" ? "selected" : ""}>Empleado</option>
                <option value="receptionist" ${empleado.role === "receptionist" ? "selected" : ""}>Recepcionista</option>
                <option value="recruiter" ${empleado.role === "recruiter" ? "selected" : ""}>Reclutador</option>
                <option value="supervisor" ${empleado.role === "supervisor" ? "selected" : ""}>Supervisor</option>
                <option value="admin" ${empleado.role === "admin" ? "selected" : ""}>Administrador</option>
              </select>
            `;
            document.getElementById("emailTexto").outerHTML = `<input id="emailInput" class="swal2-input" value="${empleado.email}">`;
            document.getElementById("estadoTexto").outerHTML = `
              <select id="estadoInput" class="swal2-input">
                <option value="activo" ${empleado.status === "activo" ? "selected" : ""}>Activo</option>
                <option value="inactivo" ${empleado.status === "inactivo" ? "selected" : ""}>Inactivo</option>
              </select>
            `;
            document.getElementById("dniTexto").outerHTML = `<input id="dniInput" class="swal2-input" value="${empleado.dni}">`;
            document.getElementById("telefonoTexto").outerHTML = `<input id="telefonoInput" class="swal2-input" value="${empleado.phone}">`;
            document.getElementById("direccionTexto").outerHTML = `<input id="direccionInput" class="swal2-input" value="${empleado.address}">`;
      
            editarBtn.textContent = "💾 Guardar cambios";
            modoEdicion = true;
          } else {
            Swal.clickConfirm();
          }
        });
      }      
    }).then(result => {
      if (result.isConfirmed && result.value) {
        fetch(`${VITE_API_URL}/employees/${result.value.id}`, {
          method: "PUT",
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(result.value)
        })
          .then(res => res.json())
          .then(() => {
            const actualizados = empleados.map(emp =>
              emp.id === result.value.id ? result.value : emp
            );
            setEmpleados(actualizados);
            Swal.fire("Guardado", "Los cambios fueron guardados.", "success");
          })
          .catch(() => {
            Swal.fire("Error", "No se pudo guardar el empleado.", "error");
          });
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
              <div class="campo">
                <label>Rol</label>
                <select id="rolInput" class="swal2-input">
                  <option value="employee">Empleado</option>
                  <option value="receptionist">Recepcionista</option>
                  <option value="recruiter">Reclutador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>
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
        const rol = document.getElementById("rolInput").value;

        if (!nombre || !puesto || !email || !estado || !dni || !telefono || !direccion || !rol) {
          Swal.showValidationMessage("Por favor, completa todos los campos.");
          return false;
        }

        return { nombre, puesto, email, estado, dni, telefono, direccion, rol };
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const nuevoEmpleado = {
          name: result.value.nombre,
          position: result.value.puesto,
          email: result.value.email,
          status: result.value.estado,
          dni: result.value.dni,
          phone: result.value.telefono,
          address: result.value.direccion,
          role: result.value.rol,
          organization_id: adminUser?.organization_id
        };
        fetch(`${VITE_API_URL}/employees`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(nuevoEmpleado)
        })
          .then(res => res.json())
          .then(data => {
            if (data.id) {
              setEmpleados([...empleados, { ...nuevoEmpleado, id: data.id }]);
              Swal.fire("Agregado", "El empleado fue agregado.", "success");
            } else {
              Swal.fire("Error", data.error || "No se pudo agregar el empleado.", "error");
            }
          })
          .catch(() => {
            Swal.fire("Error", "Fallo la conexión con el servidor.", "error");
          });
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
            <button onClick={abrirPopupAgregarEmpleado}> <UserPlus size={20} className="icono" />
               Agregar empleado</button>
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
            <select name="rol" value={filtros.rol} onChange={handleFiltroChange}>
              <option value="">Todos los roles</option>
              {rolesUnicos.map((p, idx) => (
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
            <button
              onClick={() => setVista(vista === 'grilla' ? 'tarjetas' : 'grilla')}
              title="Cambiar vista"
              className="boton-cambiar-vista"
            >
              {vista === 'grilla' ? <LayoutGrid size={24} /> : <LayoutList size={24} />}
            </button>
          </div>
        </div>

        {vista === 'grilla' ? (
          <table className="tabla-empleados">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Puesto</th>
                <th>Rol</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleadosFiltrados.map(e => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.position}</td>
                  <td>{e.role}</td>
                  <td>{e.email}</td>
                  <td>
                    <span className={`estado ${e.status}`}>{e.status}</span>
                  </td>
                  <td>
                    <button onClick={() => abrirPopup(e)}><Info size={20} className="icono" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="tarjetas-container">
            {empleadosFiltrados.map(e => (
              <div key={e.id} className="tarjeta-empleado" onClick={() => abrirPopup(e)}>
                <h3>{e.name}</h3>
                <p><strong>Puesto:</strong> {e.position}</p>
                <p><strong>Rol:</strong> {e.role}</p>
                <p><strong>Email:</strong> {e.email}</p>
                <p><strong>Estado:</strong> <span className={`estado ${e.status}`}>{e.status}</span></p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewAdmin;
