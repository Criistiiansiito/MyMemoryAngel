import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

export default function Memoria({ onBack }) {
  const { aplicarEscala } = useAccesibilidad();
  const styles = getStyles(aplicarEscala);

  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showSequence, setShowSequence] = useState(true);

  useEffect(() => {
    generateSequence();
  }, []);

  const generateSequence = () => {
    const newSequence = Array.from({ length: 5 }, () => Math.floor(Math.random() * 9) + 1);
    setSequence(newSequence);
    setShowSequence(true);
    setUserInput([]);
    setTimeout(() => setShowSequence(false), 2000); // mostrar secuencia 2 seg
  };

  const handleInput = (num) => {
    const newInput = [...userInput, num];
    setUserInput(newInput);
    if (newInput.length === sequence.length) {
      if (JSON.stringify(newInput) === JSON.stringify(sequence)) {
        Alert.alert('¡Correcto!', '¡Has recordado la secuencia!');
      } else {
        Alert.alert('Incorrecto', `La secuencia correcta era: ${sequence.join(', ')}`);
      }
      generateSequence();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Juego de Memoria</Text>
      {showSequence ? (
        <Text style={styles.sequence}>{sequence.join(' ')}</Text>
      ) : (
        <Text style={styles.sequence}>Repite la secuencia</Text>
      )}
      <View style={styles.buttonsContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity key={num} style={styles.button} onPress={() => handleInput(num)}>
            <Text style={styles.buttonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.back} onPress={onBack}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  sequence: { fontSize: 28, marginBottom: 20 },
  buttonsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  button: { width: 60, height: 60, backgroundColor: '#007bff', margin: 5, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  back: { marginTop: 30 },
  backText: { color: '#007bff', fontSize: 16 },
});
