import React from 'react';
import MenuCategoriaJuegos from '../../../../components/juegos/MenuCategoriaJuegos';

export default function MenuAtencion({ onBack, onSelectGame }) {
  return (
    <MenuCategoriaJuegos
      onBack={onBack}
      onSelectGame={onSelectGame}
      title="Atencion"
      description="Actividades para mantener el foco, localizar estimulos y reaccionar con precision."
      games={[
        {
          id: 'Atencion',
          title: 'Atencion Visual',
          description: 'Encuentra todos los simbolos iguales que el objetivo.',
          icon: 'target',
          color: '#ECFDF5',
          iconColor: '#10B981',
          showProgress: false,
        },
      ]}
    />
  );
}
