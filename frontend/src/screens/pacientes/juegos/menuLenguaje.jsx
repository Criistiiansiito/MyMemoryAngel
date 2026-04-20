import React from 'react';
import MenuCategoriaJuegos from './menuCategoriaJuegos';

export default function MenuLenguaje({ onBack, onSelectGame }) {
  return (
    <MenuCategoriaJuegos
      onBack={onBack}
      onSelectGame={onSelectGame}
      title="Lenguaje"
      description="Juegos para comprensión, vocabulario y respuesta verbal."
      games={[
        {
          id: 'Trivia',
          title: 'Trivia Cognitiva',
          description: 'Responde preguntas sencillas y refuerza conocimientos cotidianos.',
          icon: 'help-circle',
          color: '#FFFBEB',
          iconColor: '#F59E0B',
        },
      ]}
    />
  );
}
