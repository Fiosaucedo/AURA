import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-container"> 
      <h1>404 - Página no encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe. :(</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
};

export default NotFoundPage;