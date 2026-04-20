import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  Alert, Platform, StatusBar, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from '../../../../style/styles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';

const questions = [
  { question: '¿El Alzheimer afecta la memoria?', answer: 'Sí' },
  { question: '¿Es recomendable ejercitar la mente?', answer: 'Sí' },
  { question: '¿El Alzheimer se puede curar completamente?', answer: 'No' },
  { question: '¿Mantener una vida social activa ayuda al cerebro?', answer: 'Sí' },
  { question: '¿Dormir bien no tiene importancia para la memoria?', answer: 'No' },
];

export default function Trivia({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [current, setCurrent] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [finalizado, setFinalizado] = useState(false);

  const handleAnswer = (ans) => {
    const esCorrecto = ans === questions[current].answer;

    if (esCorrecto) {
      setPuntuacion((prev) => prev + 1);
    }

    const mensaje = esCorrecto
      ? '¡Excelente! Esa es la respuesta correcta. ✅'
      : `No exactamente. La respuesta era: ${questions[current].answer}. ❌`;

    Alert.alert('Resultado', mensaje, [
      {
        text: 'Continuar',
        onPress: () => {
          if (current < questions.length - 1) {
            setCurrent((prev) => prev + 1);
          } else {
            setFinalizado(true);
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[
        styles.topBar,
        { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Trivia Cognitiva</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <View style={{ width: '100%', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={{ color: '#64748B', fontWeight: '600' }}>
              Pregunta {current + 1} de {questions.length}
            </Text>
            <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>
              Puntos: {puntuacion}
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 }}>
            <View style={{
              height: '100%',
              backgroundColor: '#F59E0B',
              borderRadius: 4,
              width: `${((current + 1) / questions.length) * 100}%`
            }} />
          </View>
        </View>

        <View style={[styles.settingsCard, { width: '100%', alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }]}>
          {!finalizado ? (
            <>
              <MaterialCommunityIcons name="help-circle-outline" size={50} color="#F59E0B" />
              <Text style={{
                fontSize: aplicarEscala(22),
                fontWeight: '700',
                color: '#1E293B',
                textAlign: 'center',
                marginTop: 20,
                lineHeight: 30
              }}>
                {questions[current].question}
              </Text>
            </>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name="check-decagram" size={60} color="#10B981" />
              <Text style={{ fontSize: aplicarEscala(24), fontWeight: 'bold', color: '#1E293B', marginTop: 15 }}>
                ¡Trivia terminada!
              </Text>
              <Text style={{ fontSize: aplicarEscala(18), color: '#64748B', marginTop: 5 }}>
                Has acertado {puntuacion} de {questions.length}
              </Text>
            </View>
          )}
        </View>

        {!finalizado ? (
          <View style={{ width: '100%', marginTop: 20, gap: 15 }}>
            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: '#3B82F6', flexDirection: 'row', justifyContent: 'center', gap: 10 }]}
              onPress={() => handleAnswer('Sí')}
            >
              <MaterialCommunityIcons name="check-circle-outline" size={24} color="white" />
              <Text style={styles.mainButtonText}>Sí</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: '#EF4444', flexDirection: 'row', justifyContent: 'center', gap: 10 }]}
              onPress={() => handleAnswer('No')}
            >
              <MaterialCommunityIcons name="close-circle-outline" size={24} color="white" />
              <Text style={styles.mainButtonText}>No</Text>
            </TouchableOpacity>
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
