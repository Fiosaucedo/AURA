import React, { createContext, useState } from "react";

// Creamos el contexto
export const AuthContext = createContext();

// El provider que va a envolver la app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Simulamos el login
  const login = (email, password) => {
    // Podrías validar el email/password si quisieras
    setUser({ email });
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
