import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from '../../../../style/styles';
import { getJuegosStyles } from '../../../../style/juegosStyles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';
import { progresoJuegosService } from '../../../../services/progresoJuegosService';

const DATA_BANK = {
  trivia_facil: [
    { q: '¿El sol sale por el Este?', a: 'Sí' },
    { q: '¿El agua hierve a 10°C?', a: 'No' },
    { q: '¿Los perros son mamíferos?', a: 'Sí' },
    { q: '¿Un año tiene 12 meses?', a: 'Sí' },
    { q: '¿La luna es un planeta?', a: 'No' },
    { q: '¿El cielo despejado es azul?', a: 'Sí' },
    { q: '¿Las manzanas son herramientas?', a: 'No' },
    { q: '¿Dormir ayuda al cerebro?', a: 'Sí' },
    { q: '¿El fuego está frío?', a: 'No' },
    { q: '¿Dos más dos son cuatro?', a: 'Sí' },
    { q: '¿El azúcar es dulce?', a: 'Sí' },
    { q: '¿Los peces vuelan por el aire?', a: 'No' },
    { q: '¿El hielo es agua congelada?', a: 'Sí' },
    { q: '¿Las vacas dan leche?', a: 'Sí' },
    { q: '¿París es una fruta?', a: 'No' },
    { q: '¿El color de las plantas suele ser verde?', a: 'Sí' },
    { q: '¿Los limones son muy dulces?', a: 'No' },
    { q: '¿Caminamos con las manos?', a: 'No' },
    { q: '¿El número 5 es mayor que el 2?', a: 'Sí' },
    { q: '¿La noche es más oscura que el día?', a: 'Sí' },
  ],
  trivia_medio: [
    { q: '¿Cervantes escribió El Quijote?', a: 'Sí' },
    { q: '¿El corazón es un músculo?', a: 'Sí' },
    { q: '¿"Efímero" significa que dura mucho tiempo?', a: 'No' },
    { q: '¿Marte es el planeta rojo?', a: 'Sí' },
    { q: '¿La ballena es un pez?', a: 'No' },
    { q: '¿España está en África?', a: 'No' },
    { q: '¿Las neuronas están en el cerebro?', a: 'Sí' },
    { q: '¿Leer mejora el vocabulario?', a: 'Sí' },
    { q: '¿El Olfato es uno de los 5 sentidos?', a: 'Sí' },
    { q: '¿"Sempiterno" significa que no tiene fin?', a: 'Sí' },
    { q: '¿El Everest es la montaña más alta?', a: 'Sí' },
    { q: '¿La piel es el órgano más grande del cuerpo?', a: 'Sí' },
    { q: '¿El abecedario español tiene 50 letras?', a: 'No' },
    { q: '¿Roma es la capital de Italia?', a: 'Sí' },
    { q: '¿Los pingüinos son aves?', a: 'Sí' },
    { q: '¿El desierto del Sahara es muy húmedo?', a: 'No' },
    { q: '¿La Tierra es plana?', a: 'No' },
    { q: '¿El Amazonas es un río?', a: 'Sí' },
    { q: '¿Los humanos tienen 3 pulmones?', a: 'No' },
    { q: '¿El hidrógeno es un elemento químico?', a: 'Sí' },
  ],
  trivia_dificil: [
    { q: '¿La amígdala cerebral regula las emociones?', a: 'Sí' },
    { q: '¿El ADN está en los glóbulos rojos?', a: 'No' },
    { q: '¿"Ubicuidad" es estar en todas partes?', a: 'Sí' },
    { q: '¿La sinapsis es la unión de dos huesos?', a: 'No' },
    { q: '¿La dopamina influye en el placer?', a: 'Sí' },
    { q: '¿El hierro es un mineral?', a: 'Sí' },
    { q: '¿Los delfines respiran por branquias?', a: 'No' },
    { q: '¿La resiliencia ayuda a superar traumas?', a: 'Sí' },
    { q: '¿El hemisferio izquierdo controla el lado izquierdo del cuerpo?', a: 'No' },
    { q: '¿La vitamina C se llama ácido ascórbico?', a: 'Sí' },
    { q: '¿El fémur es el hueso más largo?', a: 'Sí' },
    { q: '¿La luz viaja más rápido que el sonido?', a: 'Sí' },
    { q: '¿Existen más de 200 países en el mundo?', a: 'No' },
    { q: '¿El cerebro consume el 20% de la energía del cuerpo?', a: 'Sí' },
    { q: '¿La ortografía estudia el sonido de letras?', a: 'No' },
    { q: '¿El páncreas produce insulina?', a: 'Sí' },
    { q: '¿La atmósfera tiene un 80% de oxígeno?', a: 'No' },
    { q: '¿La meiosis es un tipo de división celular?', a: 'Sí' },
    { q: '¿El número Pi es un número exacto?', a: 'No' },
    { q: '¿La serotonina afecta al estado de ánimo?', a: 'Sí' },
  ],
};

export default function Trivia({ onBack, difficulty = 'trivia_facil' }) {
  const { aplicarEscala, isDarkMode } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDarkMode);
  const juegosStyles = getJuegosStyles(aplicarEscala, isDarkMode);
  const insets = useSafeAreaInsets();

  const [questions, setQuestions] = useState([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState(null); 

  useEffect(() => {
    const rawData = DATA_BANK[difficulty] || [];
    // Mezcla aleatoria y selección de 10
    const shuffled = [...rawData].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
  }, [difficulty]);

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

  const handleAnswer = (ans) => {
    if (feedback || finished || questions.length === 0) return;
    
    const correct = ans === questions[round].a;
    const newScore = correct ? score + 1 : score; 
    
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore(prev => prev + 1);

    setTimeout(() => {
      if (round < 9) {
        setRound(prev => prev + 1);
        setFeedback(null);
      } else {
        finishGame(newScore);
      }
    }, 1000);
  };

  const finishGame = (finalScore) => {
    setFinished(true);
    progresoJuegosService.guardarProgreso({
      juego: difficulty,
      categoria: 'lenguaje',
      puntuacion: finalScore, 
      ultimo_resultado: `${finalScore}/10`,
    });
  };

  const feedbackStyle = feedback === 'correct' 
    ? { borderColor: '#16A34A', borderWidth: 3 } 
    : feedback === 'wrong' ? { borderColor: '#EF4444', borderWidth: 3 } : {};

  if (questions.length === 0) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={juegosStyles.headerRow}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Trivia</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={juegosStyles.scrollContent}>
        <View style={juegosStyles.progressWrapper}>
          <View style={juegosStyles.progressHeader}>
            <Text style={[juegosStyles.roundText, { color: '#F97316' }]}>
              Pregunta {Math.min(round + 1, 10)} de 10
            </Text>
            <Text style={[juegosStyles.scoreText, { color: '#F97316' }]}>Aciertos: {score}</Text>
          </View>
          <View style={juegosStyles.progressTrack}>
            <View 
              style={[
                juegosStyles.progressFill, 
                { 
                  width: `${((round + (finished ? 1 : 0)) / 10) * 100}%`, 
                  backgroundColor: '#F97316' 
                }
              ]} 
            />
          </View>
        </View>

        <View 
          style={[
            styles.settingsCard, 
            juegosStyles.gameCard, 
            feedback ? juegosStyles.gameCardActiveShadow : juegosStyles.gameCardIdleShadow,
            feedbackStyle
          ]}
        >
          {!finished ? (
            <View style={{ alignItems: 'center', minHeight: 180, justifyContent: 'center' }}>
              <MaterialCommunityIcons 
                name={feedback === 'correct' ? 'check-circle' : feedback === 'wrong' ? 'close-circle' : 'help-circle-outline'} 
                size={60} 
                color={feedback === 'correct' ? '#16A34A' : feedback === 'wrong' ? '#EF4444' : '#F97316'} 
              />
              <Text style={[juegosStyles.phaseText, { textAlign: 'center', marginTop: 15, paddingHorizontal: 10 }]}>
                {questions[round]?.q}
              </Text>
            </View>
          ) : (
            <View style={juegosStyles.finishedContent}>
              <MaterialCommunityIcons name="trophy" size={80} color="#F59E0B" />
              <Text style={juegosStyles.finishedTitle}>Juego completado</Text>
              <Text style={juegosStyles.finishedSubtitle}>Has acertado {score} de 10</Text>
            </View>
          )}
        </View>

        {!finished ? (
          <View style={{ gap: 15, marginTop: 10, width: '100%' }}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.mainButton, { backgroundColor: '#3B82F6', width: '100%' }]}
              onPress={() => handleAnswer('Sí')}
            >
              <Text style={styles.mainButtonText}>SÍ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.mainButton, { backgroundColor: '#EF4444', width: '100%' }]}
              onPress={() => handleAnswer('No')}
            >
              <Text style={styles.mainButtonText}>NO</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: '#10B981', marginTop: 20, width: '100%' }]} 
            onPress={handleBack}
          >
            <Text style={styles.mainButtonText}>Volver al menú</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
