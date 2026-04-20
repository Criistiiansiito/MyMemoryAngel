import React from 'react';
import MenuCategoriaJuegos from './menuCategoriaJuegos';

export default function MenuAtencion({ onBack, onSelectGame }) {
  return (
    <MenuCategoriaJuegos
      onBack={onBack}
      onSelectGame={onSelectGame}
      title="Atención"
      description="Actividades para mantener el foco, localizar estímulos y reaccionar con precisión."
      games={[
        {
          id: 'Atencion',
          title: 'Atención Visual',
          description: 'Encuentra todos los símbolos objetivo antes de avanzar de ronda.',
          icon: 'target',
          color: '#ECFDF5',
          iconColor: '#10B981',
        },
      ]}
    />
  );
}
