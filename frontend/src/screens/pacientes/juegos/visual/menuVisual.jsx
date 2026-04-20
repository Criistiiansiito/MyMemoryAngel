import React from 'react';
import MenuCategoriaJuegos from '../../../../components/juegos/MenuCategoriaJuegos';

export default function MenuVisual({ onBack, onSelectGame }) {
  return (
    <MenuCategoriaJuegos
      onBack={onBack}
      onSelectGame={onSelectGame}
      title="Visual"
      description="Retos para encontrar estímulos y reconocer formas y colores."
      games={[
        {
          id: 'Visual',
          title: 'Búsqueda Visual',
          description: 'Localiza la figura exacta entre varias opciones parecidas.',
          icon: 'eye-outline',
          color: '#F0FDF4',
          iconColor: '#16A34A',
        },
      ]}
    />
  );
}
