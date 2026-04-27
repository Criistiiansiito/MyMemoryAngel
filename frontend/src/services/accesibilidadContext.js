import React, { createContext, useState, useContext } from 'react';

const AccesibilidadContext = createContext();

export const AccesibilidadProvider = ({ children }) => {
  const [textSizeLabel, setTextSizeLabel] = useState('Mediano');
  const [isDaltonic, setIsDaltonic] = useState(false);

  // Sincroniza el estado global con los datos que vienen del servidor
  const cargarDesdeServidor = (datos) => {
    if (!datos) return;
    if (datos.tamano_texto) setTextSizeLabel(datos.tamano_texto);
    
    // Convertimos 0/1 de MySQL a Booleano
    const daltonismoBool = datos.modo_daltonico === 1 || datos.modo_daltonico === true;
    setIsDaltonic(daltonismoBool);
  };

  const aplicarEscala = (baseSize) => {
    switch (textSizeLabel) {
      case 'Pequeño': return Math.round(baseSize * 0.8);
      case 'Grande':  return Math.round(baseSize * 1.2);
      default:        return baseSize;
    }
  };

  return (
    <AccesibilidadContext.Provider value={{ 
        textSizeLabel, 
        setTextSizeLabel, // Cambiamos el estado directamente
        isDaltonic,
        setIsDaltonic,    // Cambiamos el estado directamente
        aplicarEscala,
        cargarDesdeServidor
    }}>
      {children}
    </AccesibilidadContext.Provider>
  );
};

export const useAccesibilidad = () => useContext(AccesibilidadContext);