import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../../../style/styles';
import { getJuegosStyles } from '../../../../style/juegosStyles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';
import { progresoJuegosService } from '../../../../services/progresoJuegosService';

const simbolos = ['★', '▲', '●', '■', '♥'];
const TOTAL_ROUNDS = 10;

const getGridConfig = (difficulty) => {
  if (difficulty === 'facil') return { columns: 3, totalCells: 9, cellSize: 88 };
  if (difficulty === 'medio') return { columns: 4, totalCells: 16, cellSize: 68 };
  return { columns: 5, totalCells: 25, cellSize: 54 };
};

const getSymbolStyle = (symbol, columns) => {
  const baseSize = columns === 5 ? 26 : 32;

  if (symbol === '♥') {
    return {
      fontSize: baseSize - 4,
      color: '#9CA3AF',
    };
  }

  return {
    fontSize: baseSize,
    color: '#334155',
  };
};

export default function Atencion({ onBack, difficulty = 'dificil' }) {
  const { aplicarEscala, isDarkMode } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDarkMode);
  const juegosStyles = getJuegosStyles(aplicarEscala, isDarkMode);
  const insets = useSafeAreaInsets();
  const gridConfig = getGridConfig(difficulty);

  const [objetivo, setObjetivo] = useState('');
  const [lista, setLista] = useState([]);
  const [ronda, setRonda] = useState(1);
  const [aciertos, setAciertos] = useState(0);
  const [finished, setFinished] = useState(false);

  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleBack = useCallback(() => {
    const hasStartedGame = ronda > 1 || aciertos > 0 || feedbackStatus;

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
  }, [aciertos, feedbackStatus, finished, onBack, ronda]);

  const guardarProgreso = (totalAciertos) => {
    progresoJuegosService
      .guardarProgreso({
        juego: `atencion_${difficulty}`,
        categoria: 'atencion',
        puntuacion: totalAciertos,
        ultimo_resultado: `${totalAciertos}/${TOTAL_ROUNDS}`,
      })
      .catch((error) => {
        console.error('Error guardando progreso de atencion:', error);
      });
  };
  
  const nuevaRonda = useCallback(() => {
    const nuevoObjetivo = simbolos[Math.floor(Math.random() * simbolos.length)];
    const nuevaLista = Array.from(
      { length: gridConfig.totalCells },
      () => simbolos[Math.floor(Math.random() * simbolos.length)]
    );

    if (!nuevaLista.includes(nuevoObjetivo)) {
      nuevaLista[Math.floor(Math.random() * nuevaLista.length)] = nuevoObjetivo;
    }

    setObjetivo(nuevoObjetivo);
    setLista(nuevaLista);
    setFeedbackStatus(null);
  }, [gridConfig.totalCells]);

  useEffect(() => {
    nuevaRonda();
  }, [nuevaRonda]);

  const mostrarFeedback = (status, texto, duration = 1500) => {
    setFeedbackStatus(status);
    setFeedbackMessage(texto);

    setTimeout(() => {
      setFeedbackStatus(null);
      setFeedbackMessage('');
    }, duration);
  };

  const finishGame = (totalAciertos) => {
    setFinished(true);
    setFeedbackStatus(null);
    guardarProgreso(totalAciertos);
  };

  const handlePress = (simbolo, index) => {
    if (finished) return;

    if (simbolo === objetivo) {
      const nuevaLista = [...lista];
      nuevaLista[index] = '';
      setLista(nuevaLista);

      const quedan = nuevaLista.filter((s) => s === objetivo).length;

      if (quedan === 0) {
        const nextScore = aciertos + 1;
        setAciertos(nextScore);

        mostrarFeedback('correct', 'Correcto');

        if (ronda < TOTAL_ROUNDS) {
          setTimeout(() => {
            setRonda((prev) => prev + 1);
            nuevaRonda();
          }, 1500);
        } else {
          finishGame(nextScore);
        }
      }
    } else {
      mostrarFeedback('wrong', 'No ha habido suerte');

      if (ronda < TOTAL_ROUNDS) {
        setTimeout(() => {
          setRonda((prev) => prev + 1);
          nuevaRonda();
        }, 1500);
      } else {
        finishGame(aciertos);
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
          <Text style={styles.brandName}>Atencion Visual</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={juegosStyles.scrollContent}>
        <View style={juegosStyles.progressWrapper}>
          <View style={juegosStyles.progressHeader}>
            <Text style={juegosStyles.roundText}>
              Ronda {Math.min(ronda, TOTAL_ROUNDS)} de {TOTAL_ROUNDS}
            </Text>
            <Text style={[juegosStyles.scoreText, { color: '#10B981' }]}>
              Aciertos: {aciertos}
            </Text>
          </View>

          <View style={juegosStyles.progressTrack}>
            <View
              style={[
                juegosStyles.progressFill,
                {
                  width: `${((ronda - 1 + (finished ? 1 : 0)) / TOTAL_ROUNDS) * 100}%`,
                  backgroundColor: '#10B981',
                },
              ]}
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
              <Text style={styles.menuSubtitle}>
                Busca todos los:
              </Text>

              <Text
                style={[
                  juegosStyles.objetivoText,
                  objetivo === '♥',
                ]}
              >
                {objetivo}
              </Text>

              {feedbackMessage ? (
              <Text
                style={[
                  juegosStyles.feedbackText,
                  {
                    color: feedbackStatus === 'correct' ? '#16A34A' : '#EF4444',
                    marginTop: 12,
                  },
                ]}
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
                Has completado {aciertos} rondas
              </Text>
            </View>
          )}
        </View>

        {!finished ? (
          <View
            style={[
              juegosStyles.grid,
              {
                width: gridConfig.columns * gridConfig.cellSize + (gridConfig.columns - 1) * 15,
              },
            ]}
          >
            {lista.map((s, i) => (
              <TouchableOpacity
                key={i}
                disabled={!s}
                style={[
                  juegosStyles.cell,
                  { width: gridConfig.cellSize, height: gridConfig.cellSize },
                  !s && juegosStyles.emptyCell,
                  s === '' && juegosStyles.hitCell,
                ]}
                onPress={() => s && handlePress(s, i)}
              >
                <Text style={getSymbolStyle(s, gridConfig.columns)}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.mainButton, juegosStyles.backButton, { marginTop: 30 }]}
            onPress={handleBack}
          >
            <Text style={styles.mainButtonText}>Volver al menu</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
