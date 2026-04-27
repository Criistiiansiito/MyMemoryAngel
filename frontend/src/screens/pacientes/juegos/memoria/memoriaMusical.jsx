import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import { getStyles } from '../../../../style/styles';
import { getJuegosStyles } from '../../../../style/juegosStyles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';
import { progresoJuegosService } from '../../../../services/progresoJuegosService';

const TOTAL_ROUNDS = 10;

const SOUND_ITEMS = [
  {
    id: 'perro',
    icon: 'dog',
    color: '#F59E0B',
    sound: require('../../../../../assets/sounds/perro.mp3'),
  },
  {
    id: 'gato',
    icon: 'cat',
    color: '#8B5CF6',
    sound: require('../../../../../assets/sounds/gato.mp3'),
  },
  {
    id: 'pajaro',
    icon: 'bird',
    color: '#3B82F6',
    sound: require('../../../../../assets/sounds/pajaro.mp3'),
  },
  {
    id: 'vaca',
    icon: 'cow',
    color: '#10B981',
    sound: require('../../../../../assets/sounds/vaca.mp3'),
  },
];

const SOUND_ROWS = [
  ['perro', 'gato'],
  ['pajaro', 'vaca'],
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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MemoriaMusical({ onBack, difficulty = 'dificil' }) {
  const { aplicarEscala, isDarkMode } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDarkMode);
  const juegosStyles = getJuegosStyles(aplicarEscala, isDarkMode);
  const insets = useSafeAreaInsets();

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showSequence, setShowSequence] = useState(true);
  const [finished, setFinished] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [activeSoundId, setActiveSoundId] = useState(null);

  const mountedRef = useRef(true);
  const roundTimeoutRef = useRef(null);
  const activeSoundRef = useRef(null);

  const getSoundItem = useCallback(
    (id) => SOUND_ITEMS.find((item) => item.id === id),
    []
  );

  const cleanupActiveSound = useCallback(async () => {
    if (activeSoundRef.current) {
      try {
        await activeSoundRef.current.stopAsync();
      } catch (_error) {}
      try {
        await activeSoundRef.current.unloadAsync();
      } catch (_error) {}
      activeSoundRef.current = null;
    }
  }, []);

  const playSoundById = useCallback(
    async (soundId, highlightDuration = 700) => {
      const soundItem = getSoundItem(soundId);
      if (!soundItem) return;

      await cleanupActiveSound();

      try {
        const { sound } = await Audio.Sound.createAsync(soundItem.sound);
        activeSoundRef.current = sound;
        setActiveSoundId(soundId);

        await sound.playAsync();
        await wait(highlightDuration);

        if (mountedRef.current) {
          setActiveSoundId(null);
        }

        try {
          await sound.stopAsync();
        } catch (_error) {}

        try {
          await sound.unloadAsync();
        } catch (_error) {}

        if (activeSoundRef.current === sound) {
          activeSoundRef.current = null;
        }
      } catch (_error) {
        if (mountedRef.current) {
          setActiveSoundId(null);
        }
      }
    },
    [cleanupActiveSound, getSoundItem]
  );

  const playSequence = useCallback(
    async (sequenceToPlay) => {
      for (let i = 0; i < sequenceToPlay.length; i += 1) {
        if (!mountedRef.current) return;
        await playSoundById(sequenceToPlay[i], 650);
        await wait(250);
      }

      if (mountedRef.current) {
        setShowSequence(false);
      }
    },
    [playSoundById]
  );

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
    progresoJuegosService
      .guardarProgreso({
        juego: `memoria_musical_${difficulty}`,
        categoria: 'memoria',
        puntuacion: finalScore,
        ultimo_resultado: `${finalScore}/${TOTAL_ROUNDS}`,
      })
      .catch((error) => {
        console.error('Error guardando progreso de memoria musical:', error);
      });
  };

  const startRound = useCallback(
    async (targetRound) => {
      const sequenceLength = getSequenceLength(targetRound, difficulty);
      const newSequence = Array.from(
        { length: sequenceLength },
        () => SOUND_ITEMS[Math.floor(Math.random() * SOUND_ITEMS.length)].id
      );

      setRound(targetRound);
      setSequence(newSequence);
      setUserInput([]);
      setShowSequence(true);
      setFeedbackStatus(null);
      setFeedbackMessage('');
      setActiveSoundId(null);

      await wait(500);
      if (!mountedRef.current) return;
      await playSequence(newSequence);
    },
    [difficulty, playSequence]
  );

  useEffect(() => {
    mountedRef.current = true;

    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch(() => {});

    startRound(1);

    return () => {
      mountedRef.current = false;
      if (roundTimeoutRef.current) {
        clearTimeout(roundTimeoutRef.current);
      }
      cleanupActiveSound();
    };
  }, [cleanupActiveSound, startRound]);

  const finishGame = (finalScore) => {
    setFinished(true);
    setShowSequence(false);
    setActiveSoundId(null);
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

  const handleInput = async (soundId) => {
    if (showSequence || finished || feedbackStatus) return;

    await playSoundById(soundId, 350);

    const nextInput = [...userInput, soundId];
    setUserInput(nextInput);

    if (nextInput.length === sequence.length) {
      const isCorrect = JSON.stringify(nextInput) === JSON.stringify(sequence);

      if (isCorrect) {
        setFeedbackStatus('correct');
        setFeedbackMessage('Correcto');
        roundTimeoutRef.current = setTimeout(() => goToNextRound(true), 1200);
      } else {
        setFeedbackStatus('wrong');
        setFeedbackMessage('No ha habido suerte');
        roundTimeoutRef.current = setTimeout(() => goToNextRound(false), 1200);
      }
    }
  };

  const feedbackStyles =
    feedbackStatus === 'correct'
      ? { borderColor: '#16A34A', shadowColor: '#16A34A' }
      : feedbackStatus === 'wrong'
        ? { borderColor: '#EF4444', shadowColor: '#EF4444' }
        : { borderColor: '#FFFFFF', shadowColor: '#000' };

  const activeSoundItem = activeSoundId ? getSoundItem(activeSoundId) : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={juegosStyles.headerRow}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Memoria Musical</Text>
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
                name={showSequence ? 'volume-high' : 'ear-hearing'}
                size={40}
                color="#8B5CF6"
              />

              <Text style={[styles.menuSubtitle, juegosStyles.phaseText, isDarkMode && { color: '#000000' }]}>
                {showSequence ? 'Escucha la secuencia:' : 'Repite los sonidos:'}
              </Text>

              <Text style={[styles.inputLabel, juegosStyles.difficultyText, isDarkMode && { color: '#000000' }]}>
                Dificultad: {sequence.length} sonidos
              </Text>

              <View style={juegosStyles.sequenceWrapper}>
                {showSequence ? (
                  activeSoundItem ? (
                    <View
                      style={[
                        localStyles.playingAnimalBox,
                        { backgroundColor: `${activeSoundItem.color}20` },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={activeSoundItem.icon}
                        size={56}
                        color={activeSoundItem.color}
                      />
                    </View>
                  ) : (
                    <View style={localStyles.playingAnimalBox}>
                      <MaterialCommunityIcons
                        name="volume-high"
                        size={40}
                        color="#8B5CF6"
                      />
                    </View>
                  )
                ) : (
                  <View style={juegosStyles.sequenceDotsRow}>
                    {sequence.map((_, index) => (
                      <View
                        key={index}
                        style={{
                          ...juegosStyles.sequenceDot,
                          backgroundColor: userInput.length > index ? '#8B5CF6' : '#DDD6FE',
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
              <MaterialCommunityIcons name="trophy" size={60} color="#10B981" />
              <Text style={juegosStyles.finishedTitle}>Juego completado</Text>
              <Text style={juegosStyles.finishedSubtitle}>
                Has acertado {score} de {TOTAL_ROUNDS} rondas
              </Text>
            </View>
          )}
        </View>

        {!finished ? (
          <View style={localStyles.grid}>
            {SOUND_ROWS.map((row) => (
              <View key={row.join('-')} style={localStyles.row}>
                {row.map((soundId) => {
                  const item = getSoundItem(soundId);
                  const isActive = activeSoundId === soundId;

                  return (
                    <TouchableOpacity
                      key={soundId}
                      style={[
                        localStyles.soundButton,
                        {
                          backgroundColor: isActive ? item.color : 'white',
                          borderColor: item.color,
                        },
                        showSequence && localStyles.soundButtonDisabled,
                      ]}
                      onPress={() => handleInput(soundId)}
                      disabled={showSequence || !!feedbackStatus}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={46}
                        color={isActive ? '#FFFFFF' : item.color}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.mainButton, juegosStyles.backButton]}
            onPress={handleBack}
          >
            <Text style={styles.mainButtonText}>Volver al menu</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const localStyles = {
  grid: {
    marginTop: 24,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  soundButton: {
    width: 140,
    height: 110,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  soundButtonDisabled: {
    opacity: 0.8,
  },
  playingAnimalBox: {
    minHeight: 90,
    minWidth: 90,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
};
