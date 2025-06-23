import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './ViewProfile.css';
import Header from '../components/Header';
import { Save, XCircle, Upload as UploadIcon } from 'lucide-react';

const ViewProfile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newProfileImageFile, setNewProfileImageFile] = useState(null);
  const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState(null);
  const navigate = useNavigate();
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      Swal.fire({
        title: 'Debes iniciar sesión',
        text: 'Por favor, inicia sesión para acceder a esta sección.',
        icon: 'error',
        confirmButtonText: 'Ir al login'
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch(`${VITE_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Error al obtener los datos del usuario.');
        }

        const data = await res.json();
        setUserData(data);
        if (data.profile_image) {
          setCurrentProfileImageUrl(`${VITE_API_URL}${data.profile_image}`);
        } else {
          setCurrentProfileImageUrl(null);
        }
      } catch (err) {
        console.error('Error al obtener datos del usuario:', err);
        Swal.fire('Error', 'No se pudieron cargar tus datos.', 'error');
      }
    };

    fetchUserData();
  }, [navigate, VITE_API_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentProfileImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setNewProfileImageFile(null);
      setCurrentProfileImageUrl(userData?.profile_image ? `${VITE_API_URL}${userData.profile_image}` : null);
    }
  };

  const handleSaveChanges = async () => {
    if (!userData) return;

    const changesMade =
      userData.email !== (userData._originalEmail || userData.email) ||
      userData.phone !== (userData._originalPhone || userData.phone) ||
      userData.address !== (userData._originalAddress || userData.address) ||
      newProfileImageFile !== null;

    if (!changesMade) {
      Swal.fire('Sin cambios', 'No has realizado ninguna modificación para guardar.', 'info');
      setIsEditing(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', userData.email || '');
      formData.append('phone', userData.phone || '');
      formData.append('address', userData.address || '');
      if (newProfileImageFile) {
        formData.append('profile_image', newProfileImageFile);
      }

      const res = await fetch(`${VITE_API_URL}/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar el perfil.');
      }

      const updatedData = await res.json();
      setUserData(updatedData);
      setNewProfileImageFile(null);
      setCurrentProfileImageUrl(updatedData.profile_image ? `${VITE_API_URL}${updatedData.profile_image}` : null);

      Swal.fire('¡Éxito!', 'Tus datos han sido actualizados correctamente.', 'success');
      setIsEditing(false);
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      Swal.fire('Error', err.message || 'No se pudieron guardar los cambios.', 'error');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewProfileImageFile(null);
    if (userData) {
      setUserData(prevData => ({
        ...prevData,
        email: prevData._originalEmail !== undefined ? prevData._originalEmail : prevData.email,
        phone: prevData._originalPhone !== undefined ? prevData._originalPhone : prevData.phone,
        address: prevData._originalAddress !== undefined ? prevData._originalAddress : prevData.address,
      }));
    }
    setCurrentProfileImageUrl(userData?.profile_image ? `${VITE_API_URL}${userData.profile_image}` : null);
  };

  const handleEditClick = () => {
    if (userData) {
      setUserData(prevData => ({
        ...prevData,
        _originalEmail: prevData.email,
        _originalPhone: prevData.phone,
        _originalAddress: prevData.address,
      }));
    }
    setIsEditing(true);
  };

  if (!userData) {
    return <div className="profile-loading">Cargando perfil...</div>;
  }

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

  return (
    <div className="profile-page">
      <Header adminUser={userData} onLogout={handleLogout} VITE_API_URL={VITE_API_URL} />

      <main className="profile-content">
        <h1>Mi Perfil</h1>

        <div className="profile-card">
          <div className="profile-main-info">
            <div className="profile-image-section">
              <div className="profile-image-container">
                {currentProfileImageUrl ? (
                  <img src={currentProfileImageUrl} alt="Foto de perfil" className="profile-image" />
                ) : (
                  <div className="profile-image-placeholder">
                    <UploadIcon size={48} />
                    <span>Sin foto</span>
                  </div>
                )}
                {isEditing && (
                  <label htmlFor="profileImageUpload" className="upload-icon-button">
                    <UploadIcon size={24} />
                    <input
                      id="profileImageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
              <h2 className="user-name-under-image">{userData.name}</h2>
            </div>

            <div className="profile-details-section">
              <div className="profile-details">
                <div className="detail-group">
                  <label>Nombre Completo:</label>
                  <p>{userData.name}</p>
                </div>
                <div className="detail-group">
                  <label>Puesto:</label>
                  <p>{userData.position}</p>
                </div>
                <div className="detail-group">
                  <label>DNI:</label>
                  <p>{userData.dni}</p>
                </div>

                <div className="detail-group">
                  <label>Email:</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={userData.email || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.email}</p>
                  )}
                </div>
                <div className="detail-group">
                  <label>Teléfono:</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.phone}</p>
                  )}
                </div>
                <div className="detail-group">
                  <label>Dirección:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={userData.address || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="save-button" onClick={handleSaveChanges}>
                  <Save size={20} /> Guardar
                </button>
                <button className="cancel-button" onClick={handleCancelEdit}>
                  <XCircle size={20} /> Cancelar
                </button>
              </>
            ) : (
              <button className="edit-button" onClick={handleEditClick}>
                ✏️ Editar Perfil
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewProfile;