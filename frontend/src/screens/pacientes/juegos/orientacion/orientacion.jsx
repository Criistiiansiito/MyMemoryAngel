import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../../../style/styles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const buildQuestions = () => {
  const now = new Date();
  const currentWeekday = WEEKDAYS[now.getDay()];
  const currentMonth = MONTHS[now.getMonth()];
  const currentYear = String(now.getFullYear());
  const currentDay = String(now.getDate());
  const currentHour = now.getHours();
  const timeOfDay = currentHour < 12 ? 'Mañana' : currentHour < 20 ? 'Tarde' : 'Noche';

  return [
    {
      id: 'weekday',
      question: '¿Qué día de la semana es hoy?',
      answer: currentWeekday,
      options: shuffle([currentWeekday, ...shuffle(WEEKDAYS.filter((item) => item !== currentWeekday)).slice(0, 2)]),
      icon: 'calendar-week',
      color: '#6366F1',
    },
    {
      id: 'month',
      question: '¿En qué mes estamos?',
      answer: currentMonth,
      options: shuffle([currentMonth, ...shuffle(MONTHS.filter((item) => item !== currentMonth)).slice(0, 2)]),
      icon: 'calendar-month',
      color: '#10B981',
    },
    {
      id: 'day',
      question: '¿Qué número de día es hoy?',
      answer: currentDay,
      options: shuffle([currentDay, String(Math.max(1, now.getDate() - 1)), String(Math.min(31, now.getDate() + 1))]),
      icon: 'calendar-today',
      color: '#F59E0B',
    },
    {
      id: 'year',
      question: '¿En qué año estamos?',
      answer: currentYear,
      options: shuffle([currentYear, String(now.getFullYear() - 1), String(now.getFullYear() + 1)]),
      icon: 'calendar-range',
      color: '#EF4444',
    },
    {
      id: 'time',
      question: '¿En qué momento del día estamos?',
      answer: timeOfDay,
      options: shuffle(['Mañana', 'Tarde', 'Noche']),
      icon: 'clock-outline',
      color: '#3B82F6',
    },
  ];
};

export default function Orientacion({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const questions = useMemo(() => buildQuestions(), []);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[current];

  const handleAnswer = (option) => {
    const isCorrect = option === currentQuestion.answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    Alert.alert(
      isCorrect ? 'Correcto' : 'Vamos otra vez',
      isCorrect ? 'Buena orientación temporal.' : `La respuesta correcta era: ${currentQuestion.answer}`,
      [
        {
          text: 'Continuar',
          onPress: () => {
            if (current < questions.length - 1) {
              setCurrent((prev) => prev + 1);
            } else {
              setFinished(true);
            }
          },
        },
      ]
    );
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
          <Text style={styles.brandName}>Orientación Temporal</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <View style={{ width: '100%', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={{ color: '#64748B', fontWeight: '600' }}>
              Pregunta {Math.min(current + 1, questions.length)} de {questions.length}
            </Text>
            <Text style={{ color: '#6366F1', fontWeight: 'bold' }}>Aciertos: {score}</Text>
          </View>
          <View style={{ height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 }}>
            <View
              style={{
                height: '100%',
                backgroundColor: '#6366F1',
                borderRadius: 4,
                width: `${((current + (finished ? 1 : 0)) / questions.length) * 100}%`,
              }}
            />
          </View>
        </View>

        <View style={[styles.settingsCard, { width: '100%', alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 }]}>
          {!finished ? (
            <>
              <MaterialCommunityIcons name={currentQuestion.icon} size={50} color={currentQuestion.color} />
              <Text
                style={{
                  fontSize: aplicarEscala(22),
                  fontWeight: '700',
                  color: '#1E293B',
                  textAlign: 'center',
                  marginTop: 20,
                  lineHeight: 30,
                }}
              >
                {currentQuestion.question}
              </Text>
            </>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name="compass" size={60} color="#10B981" />
              <Text style={{ fontSize: aplicarEscala(24), fontWeight: 'bold', color: '#1E293B', marginTop: 15 }}>
                ¡Ronda completada!
              </Text>
              <Text style={{ fontSize: aplicarEscala(18), color: '#64748B', marginTop: 5 }}>
                Has acertado {score} de {questions.length}
              </Text>
            </View>
          )}
        </View>

        {!finished ? (
          <View style={{ width: '100%', marginTop: 20, gap: 15 }}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.mainButton, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' }]}
                onPress={() => handleAnswer(option)}
              >
                <Text style={[styles.mainButtonText, { color: '#1E293B' }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
