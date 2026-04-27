import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from '../../../../style/styles';
import { getJuegosStyles } from '../../../../style/juegosStyles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';
import { progresoJuegosService } from '../../../../services/progresoJuegosService';

const DATA_BANK = {
  orientacion_facil: [
    { q: '¿Qué momento del día es?', a: 'Mañana', img: require('../../../../../assets/images/juegos/mañana.jpg'), opts: ['Mañana', 'Noche', 'Tarde'] },
    { q: '¿En qué estación caen las hojas?', a: 'Otoño', img: require('../../../../../assets/images/juegos/otoño.jpg'), opts: ['Verano', 'Otoño', 'Primavera'] },
    { q: '¿Qué necesitamos si llueve?', a: 'Paraguas', img: require('../../../../../assets/images/juegos/lloviendo.jpg'), opts: ['Gafas', 'Paraguas', 'Gorra'] },
    { q: '¿Dónde se duerme?', a: 'Dormitorio', img: require('../../../../../assets/images/juegos/dormitorio.jpg'), opts: ['Cocina', 'Baño', 'Dormitorio'] },
    { q: '¿Qué comida es el desayuno?', a: 'Café y Pan', img: require('../../../../../assets/images/juegos/desayuno.jpg'), opts: ['Café y Pan', 'Sopa', 'Ensalada'] },
    { q: '¿En qué estación hace calor?', a: 'Verano', img: require('../../../../../assets/images/juegos/verano.jpg'), opts: ['Invierno', 'Verano', 'Otoño'] },
    { q: '¿Qué objeto da la hora?', a: 'Reloj', img: require('../../../../../assets/images/juegos/reloj.jpg'), opts: ['Espejo', 'Reloj', 'Cuadro'] },
    { q: '¿Dónde nos lavamos las manos?', a: 'Lavabo', img: require('../../../../../assets/images/juegos/lavabo.jpg'), opts: ['Nevera', 'Lavabo', 'Sofá'] },
    { q: '¿Qué mes es Navidad?', a: 'Diciembre', img: require('../../../../../assets/images/juegos/navidad.jpg'), opts: ['Mayo', 'Diciembre', 'Julio'] },
    { q: '¿Qué sale de día?', a: 'El Sol', img: require('../../../../../assets/images/juegos/sol.jpg'), opts: ['La Luna', 'El Sol', 'Las Estrellas'] },
  ],
  orientacion_medio: [
    { q: 'Si ayer fue martes, ¿qué día es hoy?', a: 'Miércoles', img: require('../../../../../assets/images/juegos/calendario.jpg'), opts: ['Lunes', 'Miércoles', 'Jueves'] },
    { q: '¿Qué objeto sirve para orientarse en el mar?', a: 'Brújula', img: require('../../../../../assets/images/juegos/brujula.jpg'), opts: ['Mapa', 'Brújula', 'Reloj'] },
    { q: '¿Cuál es el tercer mes del año?', a: 'Marzo', img: require('../../../../../assets/images/juegos/meses.jpg'), opts: ['Febrero', 'Marzo', 'Abril'] },
    { q: '¿En qué lado sale el sol?', a: 'Este', img: require('../../../../../assets/images/juegos/amanecer.jpg'), opts: ['Norte', 'Este', 'Oeste'] },
    { q: '¿Qué estación sigue al invierno?', a: 'Primavera', img: require('../../../../../assets/images/juegos/primavera.jpg'), opts: ['Primavera', 'Otoño', 'Verano'] },
    { q: '¿Cuántos días tiene una semana?', a: '7 días', img: require('../../../../../assets/images/juegos/semana.jpg'), opts: ['5 días', '7 días', '30 días'] },
    { q: '¿Dónde se guardan los alimentos frescos?', a: 'Nevera', img: require('../../../../../assets/images/juegos/cocina.jpg'), opts: ['Despensa', 'Nevera', 'Horno'] },
    { q: '¿Qué hora marca un reloj con ambas agujas en las 12?', a: 'Las 12:00', img: require('../../../../../assets/images/juegos/reloj_doce.jpg'), opts: ['Las 6:00', 'Las 12:00', 'Las 3:00'] },
    { q: '¿Qué instrumento mide la temperatura?', a: 'Termómetro', img: require('../../../../../assets/images/juegos/termometro.jpg'), opts: ['Barómetro', 'Termómetro', 'Reloj'] },
    { q: '¿Qué día viene después del viernes?', a: 'Sábado', img: require('../../../../../assets/images/juegos/finde.jpg'), opts: ['Sábado', 'Domingo', 'Jueves'] },
  ],
  orientacion_dificil: [
    { q: '¿En qué hemisferio es verano en diciembre?', a: 'Sur', img: require('../../../../../assets/images/juegos/planeta.jpg'), opts: ['Norte', 'Sur', 'Ecuador'] },
    { q: 'Si estamos en el segundo trimestre, ¿qué mes puede ser?', a: 'Mayo', img: require('../../../../../assets/images/juegos/calendario.jpg'), opts: ['Febrero', 'Mayo', 'Agosto'] },
    { q: '¿Cuál es la capital de España?', a: 'Madrid', img: require('../../../../../assets/images/juegos/madrid.jpg'), opts: ['Barcelona', 'Madrid', 'Sevilla'] },
    { q: '¿Cuántos días tiene un año bisiesto?', a: '366', img: require('../../../../../assets/images/juegos/calendario.jpg'), opts: ['365', '364', '366'] },
    { q: '¿Hacia dónde apunta la aguja de la brújula?', a: 'Norte', img: require('../../../../../assets/images/juegos/brujula.jpg'), opts: ['Sur', 'Norte', 'Este'] },
    { q: '¿Qué siglo es el año 2024?', a: 'Siglo XXI', img: require('../../../../../assets/images/juegos/siglo.jpg'), opts: ['Siglo XX', 'Siglo XXI', 'Siglo XXII'] },
    { q: '¿En qué continente está Francia?', a: 'Europa', img: require('../../../../../assets/images/juegos/europa.jpg'), opts: ['Europa', 'Asia', 'América'] },
    { q: '¿Qué estación empieza el 21 de junio (Norte)?', a: 'Verano', img: require('../../../../../assets/images/juegos/verano.jpg'), opts: ['Primavera', 'Verano', 'Invierno'] },
    { q: '¿Cuántas horas hay en dos días?', a: '48', img: require('../../../../../assets/images/juegos/horas.jpg'), opts: ['24', '48', '36'] },
    { q: '¿Qué mes es el anterior a agosto?', a: 'Julio', img: require('../../../../../assets/images/juegos/calendario.jpg'), opts: ['Junio', 'Julio', 'Septiembre'] },
  ]
};

export default function Orientacion({ onBack, difficulty = 'orientacion_facil' }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const juegosStyles = getJuegosStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [questions, setQuestions] = useState([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState(null); 
  const [selectedOpt, setSelectedOpt] = useState(null);

  useEffect(() => {
    const rawData = DATA_BANK[difficulty] || DATA_BANK.orientacion_facil;
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
    if (feedback || finished) return;
    
    setSelectedOpt(ans);
    const correct = ans === questions[round].a;
    const newScore = correct ? score + 1 : score; 
    
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore(prev => prev + 1);

    setTimeout(() => {
      if (round < 9) {
        setRound(prev => prev + 1);
        setFeedback(null);
        setSelectedOpt(null);
      } else {
        finishGame(newScore);
      }
    }, 1200);
  };

  const finishGame = (finalScore) => {
    setFinished(true);
    progresoJuegosService.guardarProgreso({
      juego: difficulty, 
      categoria: 'orientacion',
      puntuacion: finalScore, 
      ultimo_resultado: `${finalScore}/10`,
    });
  };

  if (questions.length === 0) return null;

  const currentQ = questions[round];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={juegosStyles.headerRow}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Orientación</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={juegosStyles.scrollContent}>
        <View style={juegosStyles.progressWrapper}>
          <View style={juegosStyles.progressHeader}>
            <Text style={juegosStyles.roundText}>
              Ronda {Math.min(round + 1, 10)} de 10
            </Text>
            <Text style={[juegosStyles.scoreText, { color: '#6366F1' }]}>Aciertos: {score}</Text>
          </View>
          <View style={juegosStyles.progressTrack}>
            <View 
              style={[
                juegosStyles.progressFill, 
                { 
                  width: `${((round + (finished ? 1 : 0)) / 10) * 100}%`, 
                  backgroundColor: '#6366F1' 
                }
              ]} 
            />
          </View>
        </View>

        <View 
          style={[
            styles.settingsCard, 
            juegosStyles.gameCard, 
            { borderWidth: 0, elevation: 3, shadowOpacity: 0.1 },
            feedback === 'correct' ? { backgroundColor: '#F0FDF4' } : feedback === 'wrong' ? { backgroundColor: '#FEF2F2' } : {}
          ]}
        >
          {!finished ? (
            <View style={{ alignItems: 'center' }}>
            <Image 
              source={currentQ.img} 
              style={{ 
                width: 320,  
                height: 230, 
                borderRadius: 15, 
                marginBottom: 15,
                backgroundColor: '#f0f0f0' 
              }}
              resizeMode="cover"
            />
              <Text style={[juegosStyles.phaseText, { textAlign: 'center', fontSize: 20, color: '#1E293B' }]}>
                {currentQ.q}
              </Text>
            </View>
          ) : (
            <View style={juegosStyles.finishedContent}>
              <MaterialCommunityIcons name="trophy" size={60} color="#10B981" />
              <Text style={juegosStyles.finishedTitle}>Juego completado</Text>
              <Text style={juegosStyles.finishedSubtitle}>
                Has acertado {score} de 10 rondas
              </Text>
            </View>
          )}
        </View>

        {!finished ? (
          <View style={{ gap: 12, marginTop: 10, width: '100%' }}>
            {currentQ.opts.map((opt, index) => (
              <TouchableOpacity 
                key={index}
                activeOpacity={0.8}
                style={[
                  styles.mainButton, 
                  { 
                    backgroundColor: selectedOpt === opt 
                      ? (feedback === 'correct' ? '#16A34A' : '#EF4444') 
                      : '#F8FAFC',
                    borderWidth: 0, 
                    width: '100%',
                    elevation: 1
                  }
                ]}
                onPress={() => handleAnswer(opt)}
              >
                <Text style={[
                    styles.mainButtonText, 
                    { 
                        color: selectedOpt === opt ? '#FFF' : '#334155', 
                        textTransform: 'none', 
                        fontWeight: '600'
                    }
                ]}>
                  {opt}
                </Text>
              </TouchableOpacity>
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