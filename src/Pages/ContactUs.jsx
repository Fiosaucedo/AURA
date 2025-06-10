import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Header from '../components/Header'; 
import './ContactUs.css'; 

const ContactUs = () => {
  const [formData, setFormData] = useState({
    userType: '',
    name: '',
    email: '',
    phone: '',
    message: '',
    reason: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validate = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/; 

    if (!formData.userType) {
      newErrors.userType = 'Por favor, selecciona tu tipo de usuario.';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El número de teléfono es obligatorio.';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'El teléfono debe contener entre 10 y 15 dígitos numéricos.';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es obligatorio.';
    }
    if (!formData.reason) {
      newErrors.reason = 'Por favor, selecciona el motivo de tu contacto.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
  
        const data = await res.json();
  
        if (res.ok) {
          setFormData({
            userType: '',
            name: '',
            email: '',
            phone: '',
            message: '',
            reason: '',
          });
          setErrors({});
  
          Swal.fire({
            title: '¡Gracias por contactarnos!',
            text: 'A la brevedad nos estaremos comunicando contigo.',
            icon: 'success',
            confirmButtonText: 'Entendido',
          });
        } else {
          Swal.fire('Error', data.error || 'No se pudo enviar el mensaje.', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Error de red al enviar el mensaje.', 'error');
      }
    } else {
      Swal.fire({
        title: 'Formulario Incompleto',
        text: 'Por favor, revisa los campos marcados con errores.',
        icon: 'error',
        confirmButtonText: 'Ok',
      });
    }
  };

  return (
    <>
      <Header /> 
      <div className="contact-us-container">
        <h1>Contáctanos</h1>
        <p>¿Tienes alguna duda, sugerencia o reclamo? ¡Estaremos encantados de escucharte!</p>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="userType">Soy:</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className={errors.userType ? 'input-error' : ''}
            >
              <option value="">Selecciona una opción</option>
              <option value="candidato">Candidato</option>
              <option value="cliente">Cliente</option>
              <option value="empleado">Empleado</option>
            </select>
            {errors.userType && <span className="error-message">{errors.userType}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Número de Teléfono:</label>
            <input
              type="tel" 
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reason">Motivo de contacto:</label>
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={errors.reason ? 'input-error' : ''}
            >
              <option value="">Selecciona un motivo</option>
              <option value="reclamo">Reclamo</option>
              <option value="sugerencia">Sugerencia</option>
              <option value="consulta">Consulta</option>
            </select>
            {errors.reason && <span className="error-message">{errors.reason}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="message">Mensaje:</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              className={errors.message ? 'input-error' : ''}
            ></textarea>
            {errors.message && <span className="error-message">{errors.message}</span>}
          </div>

          

          <button type="submit" className="submit-button">Enviar Mensaje</button>
        </form>
      </div>
    </>
  );
};

export default ContactUs;