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
import { getJuegosStyles } from '../../../../style/juegosStyles';
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

export default function MemoriaNumerica({ onBack, difficulty = 'dificil' }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const juegosStyles = getJuegosStyles(aplicarEscala, isDaltonic);
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
      '¿Salir de la partida?',
      'Si sales ahora, perderás el progreso de esta partida.',
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
        <View style={juegosStyles.headerRow}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Memoria Numerica</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={juegosStyles.scrollContent}>
        <View style={juegosStyles.progressWrapper}>
          <View style={juegosStyles.progressHeader}>
            <Text style={juegosStyles.roundText}>
              Ronda {Math.min(round, TOTAL_ROUNDS)} de {TOTAL_ROUNDS}
            </Text>
            <Text style={juegosStyles.scoreText}>Aciertos: {score}</Text>
          </View>
          <View style={juegosStyles.progressTrack}>
            <View
              style={{
                ...juegosStyles.progressFill,
                width: `${((round - 1 + (finished ? 1 : 0)) / TOTAL_ROUNDS) * 100}%`,
              }}
            />
          </View>
        </View>

        <View
          style={[
            styles.settingsCard,
            juegosStyles.gameCard,
            feedbackStatus ? juegosStyles.gameCardActiveShadow : juegosStyles.gameCardIdleShadow,
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

              <Text style={[styles.menuSubtitle, juegosStyles.phaseText]}>
                {showSequence ? 'Memoriza estos numeros:' : 'Introduce la secuencia:'}
              </Text>

              <Text style={[styles.inputLabel, juegosStyles.difficultyText]}>
                Dificultad: {sequence.length} digitos
              </Text>

              <View style={juegosStyles.sequenceWrapper}>
                {showSequence ? (
                  <Text style={juegosStyles.sequenceText}>{sequence.join(' ')}</Text>
                ) : (
                  <View style={juegosStyles.sequenceDotsRow}>
                    {sequence.map((_, index) => (
                      <View
                        key={index}
                        style={{
                          ...juegosStyles.sequenceDot,
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
                    ...juegosStyles.feedbackText,
                    color: feedbackStatus === 'correct' ? '#16A34A' : '#EF4444',
                  }}
                >
                  {feedbackMessage}
                </Text>
              ) : null}
            </>
          ) : (
            <View style={juegosStyles.finishedContent}>
              <MaterialCommunityIcons name="calculator" size={60} color="#10B981" />
              <Text style={juegosStyles.finishedTitle}>Juego completado</Text>
              <Text style={juegosStyles.finishedSubtitle}>
                Has acertado {score} de {TOTAL_ROUNDS} rondas
              </Text>
            </View>
          )}
        </View>

        {!finished ? (
          <View style={juegosStyles.grid}>
            {NUMBER_ROWS.map((row) => (
              <View key={row.join('-')} style={juegosStyles.row}>
                {row.map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      juegosStyles.numButton,
                      showSequence ? juegosStyles.numButtonDisabled : juegosStyles.numButtonEnabled,
                    ]}
                    onPress={() => handleInput(num)}
                    disabled={showSequence}
                  >
                    <Text style={juegosStyles.numText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
