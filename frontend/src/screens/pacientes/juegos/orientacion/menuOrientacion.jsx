import React from 'react';
import MenuCategoriaJuegos from '../../../../components/juegos/MenuCategoriaJuegos';

export default function MenuOrientacion({ onBack, onSelectGame }) {
  return (
    <MenuCategoriaJuegos
      onBack={onBack}
      onSelectGame={onSelectGame}
      title="Orientación"
      description="Juegos para reforzar la referencia temporal y el contexto del día."
      games={[
        {
          id: 'NivelesOrientacion',
          title: 'Orientación Temporal',
          description: 'Responde preguntas sobre el día, el mes y el momento actual.',
          icon: 'compass-outline',
          color: '#EEF2FF',
          iconColor: '#6366F1',
        },
      ]}
    />
  );
}
