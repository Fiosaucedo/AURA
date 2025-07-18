import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash, FaMoon, FaSun } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './ViewPostulante.css';

const ViewPostulante = () => {
  const location = useLocation();
  const jobPostId = location.state?.jobPostId;
  const navigate = useNavigate();
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    cv: null,
    jobPostId: jobPostId || '',
  });

  const [errores, setErrores] = useState({});
  const [darkMode, setDarkMode] = useState(true);
  const [jobData, setJobData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  useEffect(() => {
    if (jobPostId) {
      fetch(`${VITE_API_URL}/job-posts/${jobPostId}`)
        .then(response => response.json())
        .then(data => setJobData(data))
        .catch(error => console.error('Error al cargar la oferta:', error));
    }
  }, [jobPostId]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const validar = () => {
    const nuevosErrores = {};
    const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexTelefono = /^\d{8,15}$/;

    if (!formData.name.trim() || !regexNombre.test(formData.name)) {
      nuevosErrores.nombre = 'Nombre inválido';
    }
    if (!formData.surname.trim() || !regexNombre.test(formData.surname)) {
      nuevosErrores.apellido = 'Apellido inválido';
    }
    if (!formData.email.trim() || !regexEmail.test(formData.email)) {
      nuevosErrores.email = 'Email inválido';
    }
    if (!formData.phone.trim() || !regexTelefono.test(formData.phone)) {
      nuevosErrores.telefono = 'Teléfono inválido';
    }
    if (!formData.cv) {
      nuevosErrores.cv = 'Debés subir tu CV';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validar()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("surname", formData.surname);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("cv", formData.cv);
    formDataToSend.append("job_post_id", formData.jobPostId);

    try {
      setIsSubmitting(true);

      const response = await fetch(`${VITE_API_URL}/postulacion`, {
        method: "POST",
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Postulación enviada!',
          text: 'Te contactaremos pronto.',
          confirmButtonColor: '#4e73df'
        });
        navigate('/home');
      } else {
        if (result.message === 'Ya has aplicado a este empleo anteriormente.') {
          Swal.fire({
            icon: 'warning',
            title: 'Postulación ya enviada',
            text: 'Ya te has postulado a este empleo anteriormente. ¡Gracias por tu interés!',
            confirmButtonColor: '#f6c23e'
          });
        } else {
          Swal.fire('Error', result.message || 'Error al postular', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error de conexión o servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }

    setFormData({
      name: '',
      surname: '',
      email: '',
      phone: '',
      cv: null,
      jobPostId: jobPostId || '',
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

     

      <div className="form-section">

       <div className="toggle-details-bar" onClick={() => setMostrarDetalles(prev => !prev)}>
        {mostrarDetalles ? <FaEyeSlash /> : <FaEye />}
        </div>

        {mostrarDetalles && jobData && (
          <div className="job-details-dropdown">
            {jobData.organization.logo_path && (
              <img
                src={`${VITE_API_URL}${jobData.organization.logo_path}`}
                alt="Logo Empresa"
                className="company-logo"
              />
            )}
            <h2>{jobData.title}</h2>
            <p><strong>{jobData.organization.name}</strong></p>
            <p><strong>Ubicación:</strong> {jobData.location}</p>
            <p><strong>Modalidad:</strong> {jobData.job_type}</p>
            <p><strong>Requisitos:</strong> {jobData.required_experience_years} años de experiencia, {jobData.required_education_level}</p>
            <p><strong>Descripción:</strong></p>
            <p>{jobData.description}</p>
          </div>
        )}

        <h2>Completá tus datos para postularte</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label>Nombre:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errores.nombre && <span className="error">{errores.nombre}</span>}
          </label>

          <label>Apellido:
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
            />
            {errores.apellido && <span className="error">{errores.apellido}</span>}
          </label>

          <label>Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errores.email && <span className="error">{errores.email}</span>}
          </label>

          <label>Teléfono:
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            {errores.telefono && <span className="error">{errores.telefono}</span>}
          </label>

          <label>Cargar CV:
            <input
              type="file"
              name="cv"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
            />
            {errores.cv && <span className="error">{errores.cv}</span>}
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Postulación"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ViewPostulante;
