import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../../../style/styles';
import { getJuegosStyles } from '../../../../style/juegosStyles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';
import { progresoJuegosService } from '../../../../services/progresoJuegosService';

const ICONS = ['star', 'heart', 'leaf', 'fish', 'moon-waxing-crescent', 'flower-tulip', 'anchor', 'Bell', 'Gavel'];
const COLORS = ['#EC4899', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444'];

const TOTAL_ROUNDS = 10; 

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const buildRound = (difficulty) => {
  let numCards = 4;
  if (difficulty === 'visual_medio') numCards = 6;
  if (difficulty === 'visual_dificil') numCards = 8;

  const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const correctIndex = Math.floor(Math.random() * numCards);

  const cards = Array.from({ length: numCards }, (_, index) => {
    if (index === correctIndex) return { id: index, icon, color, correct: true };
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

export default function Visual({ onBack, difficulty = 'visual_facil' }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const juegosStyles = getJuegosStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [finished, setFinished] = useState(false);
  const [game, setGame] = useState(() => buildRound(difficulty));

  const handleBack = useCallback(() => {
    if (finished || round === 0) { onBack(); return; }
    Alert.alert('¿Salir?', 'Perderás el progreso de esta partida.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: onBack },
    ]);
  }, [finished, round, onBack]);

  const handleAnswer = (card) => {
    if (feedback || finished) return;
    setSelectedId(card.id);
    const isCorrect = card.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (round < TOTAL_ROUNDS - 1) { 
        setRound(r => r + 1);
        setGame(buildRound(difficulty));
        setFeedback(null);
        setSelectedId(null);
      } else {
        const finalScore = isCorrect ? score + 1 : score;
        finishGame(finalScore);
      }
    }, 1000);
  };

  const finishGame = (finalScore) => {
    setFinished(true);
    progresoJuegosService.guardarProgreso({
      juego: difficulty,
      categoria: 'visual',
      puntuacion: finalScore,
      ultimo_resultado: `${finalScore}/${TOTAL_ROUNDS}`,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={juegosStyles.headerRow}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Búsqueda Visual</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={juegosStyles.scrollContent}>
        <View style={juegosStyles.progressWrapper}>
          <View style={juegosStyles.progressHeader}>
            <Text style={juegosStyles.roundText}>Ronda {Math.min(round + 1, TOTAL_ROUNDS)} de {TOTAL_ROUNDS}</Text>
            <Text style={[juegosStyles.scoreText, { color: '#16A34A' }]}>Aciertos: {score}</Text>
          </View>
          <View style={juegosStyles.progressTrack}>
            <View style={[juegosStyles.progressFill, { width: `${((round + (finished ? 1 : 0)) / TOTAL_ROUNDS) * 100}%`, backgroundColor: '#16A34A' }]} />
          </View>
        </View>

        <View style={[
          styles.settingsCard, 
          juegosStyles.gameCard,
          { borderWidth: 0, elevation: 0 }, 
          feedback === 'correct' ? { backgroundColor: '#F0FDF4' } : feedback === 'wrong' ? { backgroundColor: '#FEF2F2' } : { backgroundColor: '#F8FAFC' }
        ]}>
          {!finished ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={[juegosStyles.phaseText, { marginBottom: 15 }]}>Encuentra esta figura exacta:</Text>
              <View style={{
                width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF', 
                alignItems: 'center', justifyContent: 'center', elevation: 1, borderWidth: 1, borderColor: '#E2E8F0'
              }}>
                <MaterialCommunityIcons name={game.target.icon} size={45} color={game.target.color} />
              </View>
            </View>
          ) : (
            <View style={juegosStyles.finishedContent}>
              <MaterialCommunityIcons name="trophy" size={60} color="#10B981" />
              <Text style={juegosStyles.finishedTitle}>¡Juego completado!</Text>
              <Text style={juegosStyles.finishedSubtitle}>Has acertado {score} de {TOTAL_ROUNDS} rondas</Text>
            </View>
          )}
        </View>

        {!finished ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 10 }}>
            {game.cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                onPress={() => handleAnswer(card)}
                style={{
                  width: '43%', 
                  height: 85,  
                  borderRadius: 12, 
                  backgroundColor: '#FFF',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderWidth: 2,
                  borderColor: selectedId === card.id ? (feedback === 'correct' ? '#16A34A' : '#EF4444') : '#F1F5F9'
                }}
              >
                <MaterialCommunityIcons name={card.icon} size={35} color={card.color} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity style={[styles.mainButton, juegosStyles.backButton]} onPress={handleBack}>
            <Text style={styles.mainButtonText}>Volver al menu</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}