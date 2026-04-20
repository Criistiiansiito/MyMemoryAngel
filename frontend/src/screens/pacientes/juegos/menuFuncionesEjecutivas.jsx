import React from 'react';
import MenuCategoriaJuegos from './menuCategoriaJuegos';

export default function MenuFuncionesEjecutivas({ onBack, onSelectGame }) {
  return (
    <MenuCategoriaJuegos
      onBack={onBack}
      onSelectGame={onSelectGame}
      title="Funciones Ejecutivas"
      description="Retos para planificación, cálculo mental y resolución de problemas."
      games={[
        {
          id: 'Calculadora',
          title: 'Cálculo Mental',
          description: 'Resuelve operaciones rápidas para activar lógica y control mental.',
          icon: 'calculator',
          color: '#EFF6FF',
          iconColor: '#3B82F6',
        },
      ]}
    />
  );
}
