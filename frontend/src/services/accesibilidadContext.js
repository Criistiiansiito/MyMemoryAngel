import React, { createContext, useState, useContext } from 'react';
import { getAccesibilidadColors } from './accesibilidadColors';

const AccesibilidadContext = createContext();

export const AccesibilidadProvider = ({ children }) => {
  const [textSizeLabel, setTextSizeLabel] = useState('Mediano');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const colors = getAccesibilidadColors(isDarkMode);

  // Sincroniza el estado global con los datos que vienen del servidor
  const cargarDesdeServidor = (datos) => {
    if (!datos) return;
    if (datos.tamano_texto) setTextSizeLabel(datos.tamano_texto);
    
    // Convertimos 0/1 de MySQL a Booleano
    const darkModeBool = datos.modo_daltonico === 1 || datos.modo_daltonico === true;
    setIsDarkMode(darkModeBool);
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
        isDarkMode,
        setIsDarkMode,
        colors,
        aplicarEscala,
        cargarDesdeServidor
    }}>
      {children}
    </AccesibilidadContext.Provider>
  );
};

export const useAccesibilidad = () => useContext(AccesibilidadContext);
