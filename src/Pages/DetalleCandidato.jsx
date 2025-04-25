import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './DetalleCandidato.css'


const DetallePostulante = () => {
  const { id } = useParams();
  const [candidato, setCandidato] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = "http://localhost:5000";


  useEffect(() => {
    fetch(`http://127.0.0.1:5000/candidato/${id}`)
      .then(res => res.json())
      .then(data => {
        setCandidato(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener candidato:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Cargando datos del postulante...</p>;
  if (!candidato) return <p>No se encontró al postulante.</p>;

  return (
    <div className="detalle-container">
      <h2>Detalle del Postulante</h2>
      <p><strong>Nombre:</strong> {candidato.name} {candidato.surname}</p>
      <p><strong>Email:</strong> {candidato.email}</p>
      <p><strong>Teléfono:</strong> {candidato.phone}</p>
      <p><strong>CV:</strong><a href={`${API_URL}/${candidato.file_path}`} target='new'>Ver CV</a>
      </p>

      <div>
        <strong>Palabras clave detectadas en el CV:</strong>
        {candidato.keywords.length ? (
          <ul>
            {candidato.keywords.map((kw, i) => <li key={i}>{kw}</li>)}
          </ul>
        ) : (
          <p>No se detectaron palabras clave.</p>
        )}
      </div>
    </div>
  );
};

export default DetallePostulante;
