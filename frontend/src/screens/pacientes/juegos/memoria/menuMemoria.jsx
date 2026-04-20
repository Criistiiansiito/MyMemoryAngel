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
          title: 'Memoria Numérica',
          description: 'Recuerda una serie de números y reprodúcela en orden.',
          icon: 'brain',
          color: '#FDF2F8',
          iconColor: '#EC4899',
        },
      ]}
    />
  );
}
