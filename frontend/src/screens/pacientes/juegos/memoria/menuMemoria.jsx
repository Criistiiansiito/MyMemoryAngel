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
          id: 'MemoriaNumerica',
          title: 'Memoria Numerica',
          description: 'Recuerda una serie de dígitos y tecleala en orden.',
          icon: 'calculator',
          color: '#FDF2F8',
          iconColor: '#EC4899',
          showProgress: false,
        },
        {
          id: 'MemoriaMusical',
          title: 'Memoria Musical',
          description: 'Recuerda una serie de dígitos y tecleala en orden.',
          icon: 'music-note',
          color: '#FDF2F8',
          iconColor: '#EC4899',
          showProgress: false,
        },
      ]}
    />
  );
}
