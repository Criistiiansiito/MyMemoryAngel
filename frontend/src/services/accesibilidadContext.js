import React, { createContext, useState, useContext } from 'react';

const AccesibilidadContext = createContext();

export const AccesibilidadProvider = ({ children }) => {
  const [textSizeLabel, setTextSizeLabel] = useState('Mediano');

  // Lógica de multiplicadores proporcionales
  const aplicarEscala = (baseSize) => {
    switch (textSizeLabel) {
      case 'Pequeño': return Math.round(baseSize * 0.8); // -20%
      case 'Grande':  return Math.round(baseSize * 1.2); // +20%
      default:        return baseSize;                   // 100%
    }
  };

  return (
    <AccesibilidadContext.Provider value={{ textSizeLabel, setTextSizeLabel, aplicarEscala }}>
      {children}
    </AccesibilidadContext.Provider>
  );
};

export const useAccesibilidad = () => useContext(AccesibilidadContext);