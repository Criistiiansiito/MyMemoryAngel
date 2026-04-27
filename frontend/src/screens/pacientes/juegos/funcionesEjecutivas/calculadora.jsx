import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, StatusBar, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../../../style/styles';
import { getJuegosStyles } from '../../../../style/juegosStyles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';
import { progresoJuegosService } from '../../../../services/progresoJuegosService';

export default function Calculadora({ onBack, difficulty = 'calculadora_facil' }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const juegosStyles = getJuegosStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [operacion, setOperacion] = useState({ n1: 0, n2: 0, tipo: '+', res: 0 });
  const [respuesta, setRespuesta] = useState('');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const generarPregunta = useCallback(() => {
    let max = 20;
    if (difficulty === 'calculadora_medio') max = 50;
    if (difficulty === 'calculadora_dificil') max = 100;

    const n1 = Math.floor(Math.random() * max) + 1;
    const n2 = Math.floor(Math.random() * max) + 1;
    const tipo = Math.random() > 0.5 ? '+' : '-';
    
    let numA = n1, numB = n2;
    if (tipo === '-' && n1 < n2) {
        numA = n2; numB = n1;
    }

    setOperacion({
      n1: numA,
      n2: numB,
      tipo: tipo,
      res: tipo === '+' ? numA + numB : numA - numB
    });
    setRespuesta('');
    setFeedback(null);
  }, [difficulty]);

  useEffect(() => { generarPregunta(); }, [generarPregunta]);

  const handleBack = useCallback(() => {
    if (finished || (round === 0 && !feedback)) {
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
  }, [finished, round, feedback, onBack]);

  const handleComprobar = () => {
    if (feedback || !respuesta) return;
    const correct = parseInt(respuesta) === operacion.res;
    const newScore = correct ? score + 1 : score;
    
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore(newScore);

    setTimeout(() => {
      if (round < 9) {
        setRound(r => r + 1);
        generarPregunta();
      } else {
        setFinished(true);
        progresoJuegosService.guardarProgreso({
          juego: difficulty,
          categoria: 'ejecutivas',
          puntuacion: newScore,
          ultimo_resultado: `${newScore}/10`,
        });
      }
    }, 1200);
  };

  // Lógica de colores y textos del botón
  const getButtonStyles = () => {
    if (feedback === 'correct') return { bg: '#22C55E', text: '¡Correcto!' };
    if (feedback === 'wrong') return { bg: '#EF4444', text: 'No ha habido suerte' };
    return { bg: '#3B82F6', text: 'Comprobar' };
  };

  const buttonStatus = getButtonStyles();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={juegosStyles.headerRow}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Cálculo Mental</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={juegosStyles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={juegosStyles.progressWrapper}>
          <View style={juegosStyles.progressHeader}>
            <Text style={juegosStyles.roundText}>
              Ronda {Math.min(round + 1, 10)} de 10
            </Text>
            <Text style={[juegosStyles.scoreText, { color: '#3B82F6' }]}>Aciertos: {score}</Text>
          </View>
          <View style={juegosStyles.progressTrack}>
            <View 
              style={[
                juegosStyles.progressFill, 
                { 
                  width: `${((round + (finished ? 1 : 0)) / 10) * 100}%`, 
                  backgroundColor: '#3B82F6' 
                }
              ]} 
            />
          </View>
        </View>

        <View 
          style={[
            juegosStyles.gameCard,
            { 
                backgroundColor: feedback === 'correct' ? '#F0FDF4' : feedback === 'wrong' ? '#FEF2F2' : 'white',
                borderColor: feedback === 'correct' ? '#22C55E' : feedback === 'wrong' ? '#EF4444' : '#E2E8F0',
                borderRadius: 20,
            }
          ]}
        >
          {!finished ? (
            <View style={{ alignItems: 'center', width: '100%' }}>
              <Text style={[juegosStyles.phaseText, { fontSize: aplicarEscala(20), color: '#64748B' }]}>
                ¿Cuánto es?
              </Text>
              
              <Text style={[juegosStyles.objetivoText, { fontSize: aplicarEscala(52), marginVertical: 20 }]}>
                {operacion.n1} {operacion.tipo} {operacion.n2}
              </Text>

              <TextInput
                style={{ 
                  width: '70%', 
                  height: 70, 
                  fontSize: aplicarEscala(32), 
                  textAlign: 'center', 
                  backgroundColor: '#F8FAFC', 
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: '#CBD5E1',
                  color: '#1E293B',
                  fontWeight: 'bold'
                }}
                keyboardType="numeric"
                value={respuesta}
                onChangeText={setRespuesta}
                autoFocus
                editable={!feedback}
                selectionColor="#3B82F6"
              />
            </View>
          ) : (
            <View style={juegosStyles.finishedContent}>
              <MaterialCommunityIcons name="trophy" size={60} color="#10B981" />
              <Text style={juegosStyles.finishedTitle}>Juego completado</Text>
              <Text style={juegosStyles.finishedSubtitle}>
                Has acertado {score} de 10 operaciones
              </Text>
            </View>
          )}
        </View>

        {!finished ? (
          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: buttonStatus.bg, borderWidth: 0, marginTop: 30, width: 350 }]} 
            onPress={handleComprobar}
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonText}>{buttonStatus.text}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.mainButton, juegosStyles.backButton]} onPress={handleBack}>
            <Text style={styles.mainButtonText}>Volver al menú</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}