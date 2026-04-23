import React from 'react';
import MenuCategoriaJuegos from '../../../../components/juegos/MenuCategoriaJuegos';

export default function MenuMemoria({ onBack, onSelectGame }) {
  return (
    <MenuCategoriaJuegos
      onBack={onBack}
      onSelectGame={onSelectGame}
      title="Memoria"
      description="Ejercicios para recordar secuencias, patrones y datos recientes."
      games={[
        {
          id: 'Memoria',
          title: 'Memoria Numerica',
          description: 'Recuerda una serie de dígitos y tecleala en orden.',
          icon: 'calculator',
          color: '#FDF2F8',
          iconColor: '#EC4899',
          showProgress: false,
        },
      ]}
    />
  );
}
