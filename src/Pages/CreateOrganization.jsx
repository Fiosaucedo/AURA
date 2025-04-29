import { useState } from "react";

function CrearOrganizacion() {
  const [nombre, setNombre] = useState("");
  const [logo, setLogo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("organization_name", nombre);
    formData.append("logo", logo);

    try {
      const response = await fetch("https://aura-back-3h9b.onrender.com/organizations", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert("Organización creada con ID: " + result.organization_id);
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error creando organización:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre de la empresa"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setLogo(e.target.files[0])}
        required
      />
      <button type="submit">Crear Organización</button>
    </form>
  );
}

export default CrearOrganizacion;
