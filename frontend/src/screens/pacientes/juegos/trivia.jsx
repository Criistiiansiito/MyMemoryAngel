import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

const questions = [
  { question: '¿El Alzheimer afecta la memoria?', answer: 'Sí' },
  { question: '¿Es recomendable ejercitar la mente?', answer: 'Sí' },
  { question: '¿El Alzheimer se puede curar completamente?', answer: 'No' },
];

export default function Trivia({ onBack }) {
  const { aplicarEscala } = useAccesibilidad();
  const styles = getStyles(aplicarEscala);
  
  const [current, setCurrent] = useState(0);

  const handleAnswer = (ans) => {
    if (ans === questions[current].answer) {
      Alert.alert('¡Correcto!', 'Respuesta correcta');
    } else {
      Alert.alert('Incorrecto', `La respuesta correcta era: ${questions[current].answer}`);
    }
    setCurrent((prev) => (prev + 1) % questions.length);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trivia Cognitiva</Text>
      <Text style={styles.question}>{questions[current].question}</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleAnswer('Sí')}>
        <Text style={styles.buttonText}>Sí</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleAnswer('No')}>
        <Text style={styles.buttonText}>No</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.back} onPress={onBack}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  question: { fontSize: 20, marginBottom: 15, textAlign: 'center' },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, marginVertical: 10, width: 120, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  back: { marginTop: 20 },
  backText: { color: '#007bff', fontSize: 16 },
});
