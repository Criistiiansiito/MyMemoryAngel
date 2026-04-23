import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../../../style/styles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';
import { progresoJuegosService } from '../../../../services/progresoJuegosService';

const TOTAL_ROUNDS = 10;
const NUMBER_ROWS = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const getSequenceLength = (round, difficulty) => {
  if (difficulty === 'facil') return 2;
  if (difficulty === 'medio') return 3;
  if (difficulty === 'dificil') return 4;
  if (round <= 3) return 2;
  if (round <= 6) return 3;
  if (round <= 8) return 4;
  return 5;
};

const getLocalStyles = (aplicarEscala) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    scrollContent: {
      padding: 20,
      alignItems: 'center',
    },
    progressWrapper: {
      width: '100%',
      marginBottom: 20,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    roundText: {
      color: '#64748B',
      fontWeight: '600',
    },
    scoreText: {
      color: '#EC4899',
      fontWeight: 'bold',
    },
    progressTrack: {
      height: 8,
      backgroundColor: '#E2E8F0',
      borderRadius: 4,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#EC4899',
      borderRadius: 4,
    },
    gameCard: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 30,
      borderWidth: 2,
    },
    gameCardIdleShadow: {
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    gameCardActiveShadow: {
      shadowOpacity: 0.2,
      shadowRadius: 10,
    },
    phaseText: {
      marginTop: 10,
      marginBottom: 0,
      textAlign: 'center',
    },
    difficultyText: {
      marginTop: 8,
      marginBottom: 0,
      textTransform: 'none',
      letterSpacing: 0,
      color: '#94A3B8',
    },
    sequenceWrapper: {
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 20,
    },
    sequenceText: {
      fontSize: aplicarEscala(40),
      fontWeight: '800',
      color: '#EC4899',
      letterSpacing: 10,
    },
    sequenceDotsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    sequenceDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    feedbackText: {
      fontSize: aplicarEscala(22),
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 4,
    },
    finishedContent: {
      alignItems: 'center',
    },
    finishedTitle: {
      fontSize: aplicarEscala(24),
      fontWeight: 'bold',
      color: '#1E293B',
      marginTop: 15,
    },
    finishedSubtitle: {
      fontSize: aplicarEscala(18),
      color: '#64748B',
      marginTop: 5,
    },
    grid: {
      alignItems: 'center',
      width: '100%',
      marginTop: 20,
      gap: 15,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 15,
    },
    numButton: {
      width: 100,
      height: 100,
      backgroundColor: 'white',
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: '#F1F5F9',
    },
    numButtonEnabled: {
      opacity: 1,
    },
    numButtonDisabled: {
      opacity: 0.5,
    },
    numText: {
      fontSize: 32,
      fontWeight: '700',
      color: '#334155',
    },
    backButton: {
      marginTop: 20,
      width: '100%',
      backgroundColor: '#10B981',
    },
  });

export default function Memoria({ onBack, difficulty = 'dificil' }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const localStyles = getLocalStyles(aplicarEscala);
  const insets = useSafeAreaInsets();

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showSequence, setShowSequence] = useState(true);
  const [finished, setFinished] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleBack = useCallback(() => {
    const hasStartedGame = round > 1 || score > 0 || userInput.length > 0 || feedbackStatus;

    if (finished || !hasStartedGame) {
      onBack();
      return;
    }

    Alert.alert(
      'Salir de la partida',
      'No se te guardara el progreso de esta partida.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: onBack },
      ]
    );
  }, [feedbackStatus, finished, onBack, round, score, userInput.length]);

  const guardarProgreso = (finalScore) => {
    progresoJuegosService.guardarProgreso({
      juego: `memoria_${difficulty}`,
      categoria: 'memoria',
      puntuacion: finalScore,
      ultimo_resultado: `${finalScore}/${TOTAL_ROUNDS}`,
    }).catch((error) => {
      console.error('Error guardando progreso de memoria:', error);
    });
  };

  const startRound = useCallback(
    (targetRound) => {
      const sequenceLength = getSequenceLength(targetRound, difficulty);
      const newSequence = Array.from(
        { length: sequenceLength },
        () => Math.floor(Math.random() * 9) + 1
      );

      setRound(targetRound);
      setSequence(newSequence);
      setUserInput([]);
      setShowSequence(true);
      setFeedbackStatus(null);
      setFeedbackMessage('');

      setTimeout(() => setShowSequence(false), 3500);
    },
    [difficulty]
  );

  useEffect(() => {
    startRound(1);
  }, [startRound]);

  const finishGame = (finalScore) => {
    setFinished(true);
    guardarProgreso(finalScore);
  };

  const goToNextRound = (wasCorrect) => {
    const nextScore = score + (wasCorrect ? 1 : 0);
    if (wasCorrect) {
      setScore(nextScore);
    }

    if (round >= TOTAL_ROUNDS) {
      finishGame(nextScore);
      return;
    }

    startRound(round + 1);
  };

  const handleInput = (num) => {
    if (showSequence || finished || feedbackStatus) return;

    const nextInput = [...userInput, num];
    setUserInput(nextInput);

    if (nextInput.length === sequence.length) {
      const isCorrect = JSON.stringify(nextInput) === JSON.stringify(sequence);

      if (isCorrect) {
        setFeedbackStatus('correct');
        setFeedbackMessage('Correcto');
        setTimeout(() => goToNextRound(true), 1500);
      } else {
        setFeedbackStatus('wrong');
        setFeedbackMessage('No ha habido suerte');
        setTimeout(() => goToNextRound(false), 1500);
      }
    }
  };

  const feedbackStyles =
    feedbackStatus === 'correct'
      ? { borderColor: '#16A34A', shadowColor: '#16A34A' }
      : feedbackStatus === 'wrong'
        ? { borderColor: '#EF4444', shadowColor: '#EF4444' }
        : { borderColor: '#FFFFFF', shadowColor: '#000' };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={localStyles.headerRow}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Memoria Numerica</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        <View style={localStyles.progressWrapper}>
          <View style={localStyles.progressHeader}>
            <Text style={localStyles.roundText}>
              Ronda {Math.min(round, TOTAL_ROUNDS)} de {TOTAL_ROUNDS}
            </Text>
            <Text style={localStyles.scoreText}>Aciertos: {score}</Text>
          </View>
          <View style={localStyles.progressTrack}>
            <View
              style={{
                ...localStyles.progressFill,
                width: `${((round - 1 + (finished ? 1 : 0)) / TOTAL_ROUNDS) * 100}%`,
              }}
            />
          </View>
        </View>

        <View
          style={[
            styles.settingsCard,
            localStyles.gameCard,
            feedbackStatus ? localStyles.gameCardActiveShadow : localStyles.gameCardIdleShadow,
            feedbackStyles,
          ]}
        >
          {!finished ? (
            <>
              <MaterialCommunityIcons
                name={showSequence ? 'eye-outline' : 'eye-off-outline'}
                size={40}
                color="#EC4899"
              />

              <Text style={[styles.menuSubtitle, localStyles.phaseText]}>
                {showSequence ? 'Memoriza estos numeros:' : 'Introduce la secuencia:'}
              </Text>

              <Text style={[styles.inputLabel, localStyles.difficultyText]}>
                Dificultad: {sequence.length} digitos
              </Text>

              <View style={localStyles.sequenceWrapper}>
                {showSequence ? (
                  <Text style={localStyles.sequenceText}>{sequence.join(' ')}</Text>
                ) : (
                  <View style={localStyles.sequenceDotsRow}>
                    {sequence.map((_, index) => (
                      <View
                        key={index}
                        style={{
                          ...localStyles.sequenceDot,
                          backgroundColor: userInput.length > index ? '#EC4899' : '#FBCFE8',
                        }}
                      />
                    ))}
                  </View>
                )}
              </View>

              {feedbackMessage ? (
                <Text
                  style={{
                    ...localStyles.feedbackText,
                    color: feedbackStatus === 'correct' ? '#16A34A' : '#EF4444',
                  }}
                >
                  {feedbackMessage}
                </Text>
              ) : null}
            </>
          ) : (
            <View style={localStyles.finishedContent}>
              <MaterialCommunityIcons name="calculator" size={60} color="#10B981" />
              <Text style={localStyles.finishedTitle}>Juego completado</Text>
              <Text style={localStyles.finishedSubtitle}>
                Has acertado {score} de {TOTAL_ROUNDS} rondas
              </Text>
            </View>
          )}
        </View>

        {!finished ? (
          <View style={localStyles.grid}>
            {NUMBER_ROWS.map((row) => (
              <View key={row.join('-')} style={localStyles.row}>
                {row.map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      localStyles.numButton,
                      showSequence ? localStyles.numButtonDisabled : localStyles.numButtonEnabled,
                    ]}
                    onPress={() => handleInput(num)}
                    disabled={showSequence}
                  >
                    <Text style={localStyles.numText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity style={[styles.mainButton, localStyles.backButton]} onPress={handleBack}>
            <Text style={styles.mainButtonText}>Volver al menu</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
