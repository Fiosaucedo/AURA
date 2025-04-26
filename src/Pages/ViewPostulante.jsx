import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './ViewPostulante.css';

const ViewPostulante = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    cv: null,
  });

  const [errores, setErrores] = useState({});
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const validar = () => {
    const nuevosErrores = {};
    const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!formData.name.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (!regexNombre.test(formData.name)) {
      nuevosErrores.nombre = 'El nombre solo debe contener letras';
    }

    if (!formData.surname.trim()) {
      nuevosErrores.apellido = 'El apellido es obligatorio';
    } else if (!regexNombre.test(formData.surname)) {
      nuevosErrores.apellido = 'El apellido solo debe contener letras';
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!regexEmail.test(formData.email)) {
      nuevosErrores.email = 'El email no es válido';
    }

    const regexTelefono = /^\d{8,15}$/;
    if (!formData.phone.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio';
    } else if (!regexTelefono.test(formData.phone)) {
      nuevosErrores.telefono = 'El teléfono debe tener entre 8 y 15 números';
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("surname", formData.surname);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("cv", formData.cv);

    if (!validar()) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/postulacion", {
        method: "POST",
        body: formDataToSend
      });
      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Postulación enviada',
          text: '¡Gracias por postularte! Te contactaremos pronto.',
          confirmButtonColor: '#4e73df'
        });
      }
    } catch (err) {
      console.error(err);
    }

    setFormData({
      name: '',
      surname: '',
      email: '',
      phone: '',
      cv: null,
    });
    setErrores({});
    e.target.reset();
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  return (
    <div className={`postulante-container ${darkMode ? 'dark' : 'light'}`}>

      <div className="aura-label" onClick={() => navigate('/home')}>
        ✨Aura✨
      </div>

      <div className="theme-switch" onClick={toggleTheme}>
        {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
      </div>

      <h2>Postulate a una vacante</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label>Nombre:
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
          {errores.nombre && <span className="error">{errores.nombre}</span>}
        </label>
        <label>Apellido:
          <input type="text" name="surname" value={formData.surname} onChange={handleChange} />
          {errores.apellido && <span className="error">{errores.apellido}</span>}
        </label>
        <label>Email:
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
          {errores.email && <span className="error">{errores.email}</span>}
        </label>
        <label>Teléfono:
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          {errores.telefono && <span className="error">{errores.telefono}</span>}
        </label>
        <label>Cargar CV:
          <input type="file" name="cv" accept=".pdf,.doc,.docx" onChange={handleChange} />
          {errores.cv && <span className="error">{errores.cv}</span>}
        </label>

        <button type="submit">Enviar Postulación</button>
      </form>
    </div>
  );
};

export default ViewPostulante;
