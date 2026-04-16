import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, Platform, StatusBar, 
  ScrollView, Alert, StyleSheet 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

export default function Memoria({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showSequence, setShowSequence] = useState(true);

  useEffect(() => {
    generateSequence();
  }, []);

  const generateSequence = () => {
    // Generamos 4 números para empezar (puedes subirlo a 5 si prefieres)
    const newSequence = Array.from({ length: 4 }, () => Math.floor(Math.random() * 9) + 1);
    setSequence(newSequence);
    setShowSequence(true);
    setUserInput([]);
    
    // Damos 3 segundos para memorizar
    setTimeout(() => setShowSequence(false), 3000);
  };

  const handleInput = (num) => {
    if (showSequence) return; // Evitar clics mientras se muestra la secuencia

    const newInput = [...userInput, num];
    setUserInput(newInput);

    if (newInput.length === sequence.length) {
      if (JSON.stringify(newInput) === JSON.stringify(sequence)) {
        Alert.alert('¡Excelente! 🧠', 'Has recordado la serie correctamente.', [
          { text: 'Siguiente nivel', onPress: generateSequence }
        ]);
      } else {
        Alert.alert('Casi...', `La serie era: ${sequence.join(' - ')}`, [
          { text: 'Reintentar', onPress: generateSequence }
        ]);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* CABECERA DINÁMICA */}
      <View style={[
        styles.topBar, 
        { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Memoria Numérica</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        
        {/* PANEL CENTRAL */}
        <View style={[styles.settingsCard, { width: '100%', alignItems: 'center', paddingVertical: 30 }]}>
          <MaterialCommunityIcons 
            name={showSequence ? "eye-outline" : "form-textbox-password"} 
            size={40} 
            color={showSequence ? "#EC4899" : "#6366F1"} 
          />
          
          <Text style={{ fontSize: aplicarEscala(18), color: '#64748B', marginTop: 10, textAlign: 'center' }}>
            {showSequence ? "Memoriza estos números:" : "Introduce la secuencia:"}
          </Text>

          <View style={{ height: 100, justifyContent: 'center', alignItems: 'center', marginVertical: 20 }}>
            {showSequence ? (
              <Text style={{ fontSize: aplicarEscala(40), fontWeight: '800', color: '#EC4899', letterSpacing: 10 }}>
                {sequence.join(' ')}
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {sequence.map((_, index) => (
                  <View 
                    key={index} 
                    style={{
                      width: 20, 
                      height: 20, 
                      borderRadius: 10, 
                      backgroundColor: userInput.length > index ? '#6366F1' : '#E2E8F0'
                    }} 
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* TECLADO NUMÉRICO */}
        <View style={localStyles.grid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity 
              key={num} 
              style={[
                localStyles.numButton, 
                { opacity: showSequence ? 0.5 : 1 }
              ]} 
              onPress={() => handleInput(num)}
              disabled={showSequence}
            >
              <Text style={localStyles.numText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!showSequence && (
          <TouchableOpacity 
            style={{ marginTop: 20 }} 
            onPress={generateSequence}
          >
            <Text style={{ color: '#6366F1', fontWeight: '600' }}>Ver de nuevo</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    gap: 15
  },
  numButton: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  numText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#334155'
  }
});