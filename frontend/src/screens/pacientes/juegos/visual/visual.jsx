import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../../../style/styles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';

const ICONS = ['star', 'heart', 'leaf', 'fish', 'moon-waxing-crescent', 'flower-tulip'];
const COLORS = ['#EC4899', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444'];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const buildRound = () => {
  const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const correctIndex = Math.floor(Math.random() * 6);

  const cards = Array.from({ length: 6 }, (_, index) => {
    if (index === correctIndex) {
      return { id: index, icon, color, correct: true };
    }

    const otherIcon = shuffle(ICONS.filter((item) => item !== icon))[0];
    const otherColor = shuffle(COLORS.filter((item) => item !== color))[0];
    const useSameIcon = Math.random() > 0.5;

    return {
      id: index,
      icon: useSameIcon ? icon : otherIcon,
      color: useSameIcon ? otherColor : color,
      correct: false,
    };
  });

  return { target: { icon, color }, cards: shuffle(cards) };
};

export default function Visual({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [finished, setFinished] = useState(false);
  const [game, setGame] = useState(() => buildRound());

  const progress = useMemo(() => `${round} / 5`, [round]);

  const nextRound = (wasCorrect) => {
    if (wasCorrect) {
      setScore((prev) => prev + 1);
      setFeedback('¡Correcto!');
    } else {
      setFeedback('Casi, prueba la siguiente.');
    }

    if (round >= 5) {
      setFinished(true);
      return;
    }

    setTimeout(() => {
      setRound((prev) => prev + 1);
      setGame(buildRound());
      setFeedback('');
    }, 700);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View
        style={[
          styles.topBar,
          { paddingTop: Platform.OS === 'ios' ? insets.top : 20 },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Búsqueda Visual</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <View style={[styles.settingsCard, { width: '100%', alignItems: 'center', paddingVertical: 24, marginBottom: 20 }]}>
          {!finished ? (
            <>
              <Text style={{ fontSize: aplicarEscala(16), color: '#64748B' }}>Ronda {progress}</Text>
              <Text style={{ fontSize: aplicarEscala(18), fontWeight: '700', color: '#1E293B', marginTop: 12 }}>
                Encuentra esta figura exacta
              </Text>
              <View
                style={{
                  marginTop: 18,
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  backgroundColor: '#F8FAFC',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#E2E8F0',
                }}
              >
                <MaterialCommunityIcons name={game.target.icon} size={44} color={game.target.color} />
              </View>
              <Text style={{ fontSize: aplicarEscala(14), color: '#64748B', marginTop: 12 }}>
                Aciertos: {score}
              </Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="eye-check-outline" size={60} color="#10B981" />
              <Text style={{ fontSize: aplicarEscala(24), fontWeight: 'bold', color: '#1E293B', marginTop: 15 }}>
                ¡Juego completado!
              </Text>
              <Text style={{ fontSize: aplicarEscala(18), color: '#64748B', marginTop: 5 }}>
                Has acertado {score} de 5 rondas
              </Text>
            </>
          )}
        </View>

        {!finished ? (
          <>
            <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
              {game.cards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={{
                    width: '47%',
                    height: 110,
                    borderRadius: 20,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                  onPress={() => nextRound(card.correct)}
                >
                  <MaterialCommunityIcons name={card.icon} size={40} color={card.color} />
                </TouchableOpacity>
              ))}
            </View>

            {feedback ? (
              <Text style={{ marginTop: 18, fontSize: aplicarEscala(17), fontWeight: '700', color: feedback.includes('Correcto') ? '#10B981' : '#F59E0B' }}>
                {feedback}
              </Text>
            ) : null}
          </>
        ) : (
          <TouchableOpacity
            style={[styles.mainButton, { marginTop: 20, width: '100%', backgroundColor: '#10B981' }]}
            onPress={onBack}
          >
            <Text style={styles.mainButtonText}>Volver al menú</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
