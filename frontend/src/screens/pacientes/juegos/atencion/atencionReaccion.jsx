import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Image, 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../../../style/styles';
import { getJuegosStyles } from '../../../../style/juegosStyles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';
import { progresoJuegosService } from '../../../../services/progresoJuegosService';

const TOTAL_TIEMPO = 30;
const RATON_IMAGE = require('../../../../../assets/images/raton.png');

export default function AtencionReaccion({ onBack, difficulty = 'facil' }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const juegosStyles = getJuegosStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const config = {
    'facil':   { grid: 2, tiempoAparicion: 3000, tiempoVisible: 2000, size: 140 },
    'medio':   { grid: 3, tiempoAparicion: 2000, tiempoVisible: 1500,  size: 100 },
    'dificil': { grid: 4, tiempoAparicion: 1500, tiempoVisible: 1000,  size: 80  },
  }[difficulty] || { grid: 2, tiempoAparicion: 2000, tiempoVisible: 1200, size: 140 };

  const numCeldas = config.grid * config.grid;
  const gapGrid = 10;
  const containerWidth = (config.size * config.grid) + (gapGrid * (config.grid + 1));

  const [activo, setActivo] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [apariciones, setApariciones] = useState(0);
  const [tiempo, setTiempo] = useState(TOTAL_TIEMPO);
  const [jugando, setJugando] = useState(true);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const juegoRef = useRef(null);

  const handleBackAttempt = () => {
    if (jugando && tiempo > 0) {
      Alert.alert(
        "¿Salir de la partida?",
        "Si sales ahora, perderás el progreso de esta partida.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Salir", style: "destructive", onPress: onBack }
        ]
      );
    } else {
      onBack();
    }
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTiempo((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(juegoRef.current);
          setJugando(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(juegoRef.current);
    };
  }, []);

  const aparecerFigura = useCallback(() => {
    const nuevoActivo = Math.floor(Math.random() * numCeldas);
    setActivo(nuevoActivo);
    setApariciones(prev => prev + 1);

    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setActivo(null));
    }, config.tiempoVisible);
  }, [numCeldas, config.tiempoVisible]);

  useEffect(() => {
    if (jugando) {
      juegoRef.current = setInterval(aparecerFigura, config.tiempoAparicion);
    }
    return () => clearInterval(juegoRef.current);
  }, [jugando, aparecerFigura, config.tiempoAparicion]);

  const handlePress = (index) => {
    if (index === activo) {
      setPuntos(p => p + 1);
      setActivo(null);
    }
  };

  useEffect(() => {
    if (!jugando && apariciones > 0) {
      const nivelKey = difficulty.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      progresoJuegosService.guardarProgreso({
        juego: `atencion_reaccion_${nivelKey}`,
        categoria: 'atencion',
        puntuacion: puntos,
        ultimo_resultado: `${puntos}/${apariciones} topos`,
      }).catch(console.error);
    }
  }, [jugando]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={juegosStyles.headerRow}>
          <TouchableOpacity onPress={handleBackAttempt}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Caza al Ratón</Text>
        </View>
      </View>

      <View style={{ padding: 20, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 }}>
          <View style={[styles.settingsCard, { flex: 1, marginRight: 10, alignItems: 'center', padding: 10 }]}>
            <Text style={{ color: '#64748B' }}>Tiempo</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: tiempo < 10 ? '#EF4444' : '#334155' }}>
              {tiempo}s
            </Text>
          </View>
          <View style={[styles.settingsCard, { flex: 1, marginLeft: 10, alignItems: 'center', padding: 10 }]}>
            <Text style={{ color: '#64748B' }}>Capturados</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>{puntos}/{apariciones}</Text>
          </View>
        </View>

        {jugando ? (
          <>
            <Text style={{ fontSize: 18, color: '#64748B', marginBottom: 20, textAlign: 'center', marginTop: 50 }}>
              ¡Rápido! Toca al <Text style={{ color: '#8B4513', fontWeight: 'bold' }}>Ratón</Text>
            </Text>

            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              width: containerWidth, 
              gap: gapGrid 
            }}>
              {Array.from({ length: numCeldas }).map((_, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={1}
                  onPress={() => handlePress(i)}
                  style={{
                    width: config.size,
                    height: config.size,
                    borderRadius: config.size / 2,
                    backgroundColor: '#5D4037', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 5,
                    borderColor: '#3E2723', 
                    overflow: 'hidden'
                  }}
                >
                  {activo === i && (
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                      <Image 
                        source={RATON_IMAGE} 
                        style={{ 
                          width: config.size * 0.8, 
                          height: config.size * 0.8,
                          resizeMode: 'contain'
                        }} 
                      />
                    </Animated.View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={[styles.settingsCard, { padding: 40, alignItems: 'center', width: '100%' }]}>
            <MaterialCommunityIcons name="trophy" size={100} color="#10B981" />
            <Text style={{ fontSize: 26, fontWeight: 'bold', marginTop: 20 }}>¡Juego Terminado!</Text>
            <Text style={{ fontSize: 20, color: '#64748B', marginTop: 10 }}>
              Puntuación final: 
              <Text style={{ fontWeight: 'bold', color: '#334155' }}> {puntos} de {apariciones}</Text>
            </Text>
            <TouchableOpacity 
              style={[styles.mainButton, { 
                marginTop: 30, 
                width: '100%', 
                backgroundColor: '#10B981'
              }]} 
              onPress={onBack}
            >
              <Text style={styles.mainButtonText}>Volver al menu</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}