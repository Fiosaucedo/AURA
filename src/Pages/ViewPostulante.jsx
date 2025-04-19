import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './ViewPostulante.css';

const ViewPostulante = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cv: null,
  });

  const [errores, setErrores] = useState({});

  const validar = () => {
    const nuevosErrores = {};

    // Nombre y Apellido: solo letras y espacios (con tildes)
    const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (!regexNombre.test(formData.nombre)) {
      nuevosErrores.nombre = 'El nombre solo debe contener letras';
    }

    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es obligatorio';
    } else if (!regexNombre.test(formData.apellido)) {
      nuevosErrores.apellido = 'El apellido solo debe contener letras';
    }

    // Email
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!regexEmail.test(formData.email)) {
      nuevosErrores.email = 'El email no es válido';
    }

    // Teléfono: solo números, entre 8 y 15 dígitos
    const regexTelefono = /^\d{8,15}$/;
    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio';
    } else if (!regexTelefono.test(formData.telefono)) {
      nuevosErrores.telefono = 'El teléfono debe tener entre 8 y 15 números';
    }

    // CV: obligatorio y con extensión válida
    const cv = formData.cv;
    if (!cv) {
      nuevosErrores.cv = 'Debés subir tu CV';
    } else {
      const extensionesPermitidas = ['pdf', 'doc', 'docx'];
      const extension = cv.name.split('.').pop().toLowerCase();
      if (!extensionesPermitidas.includes(extension)) {
        nuevosErrores.cv = 'Formato de archivo no válido. Solo PDF, DOC o DOCX.';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validar()) {
      Swal.fire({
        icon: 'success',
        title: 'Postulación enviada',
        text: '¡Gracias por postularte! Te contactaremos pronto.',
        confirmButtonColor: '#4e73df',
      });

      console.log('Datos enviados:', formData);

      // Limpiar el formulario
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        cv: null,
      });
      setErrores({});
      e.target.reset();
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  return (
    <div className="postulante-container">
      <h2>Postulate a una vacante</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label>
          Nombre:
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
          {errores.nombre && <span className="error">{errores.nombre}</span>}
        </label>

        <label>
          Apellido:
          <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} />
          {errores.apellido && <span className="error">{errores.apellido}</span>}
        </label>

        <label>
          Email:
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
          {errores.email && <span className="error">{errores.email}</span>}
        </label>

        <label>
          Teléfono:
          <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
          {errores.telefono && <span className="error">{errores.telefono}</span>}
        </label>

        <label>
          Cargar CV:
          <input type="file" name="cv" accept=".pdf,.doc,.docx" onChange={handleChange} />
          {errores.cv && <span className="error">{errores.cv}</span>}
        </label>

        <button type="submit">Enviar Postulación</button>
      </form>
    </div>
  );
};

export default ViewPostulante;
