import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../../../style/styles';
import { getJuegosStyles } from '../../../../style/juegosStyles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';
import { progresoJuegosService } from '../../../../services/progresoJuegosService';

const LEVELS = [
  {
    id: 'facil',
    title: 'Nivel Fácil',
    description: 'Cuadrícula de 3x3.',
    icon: 'circle-outline',
    color: '#ECFDF5',
    iconColor: '#10B981',
  },
  {
    id: 'medio',
    title: 'Nivel Medio',
    description: 'Cuadrícula de 4x4.',
    icon: 'circle-half-full',
    color: '#ECFDF5',
    iconColor: '#10B981',
  },
  {
    id: 'dificil',
    title: 'Nivel Difícil',
    description: 'Cuadrícula de 5x5.',
    icon: 'checkbox-blank-circle',
    color: '#ECFDF5',
    iconColor: '#10B981',
  },
];

const ATENCION_KEYS = ['atencion_facil', 'atencion_medio', 'atencion_dificil'];

const normalizeGameKey = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default function NivelesAtencion({ onBack, onSelectDifficulty }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const juegosStyles = getJuegosStyles(aplicarEscala);
  const insets = useSafeAreaInsets();
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const response = await progresoJuegosService.obtenerMiProgreso();
        const rows = response.progreso || [];
        if (cancelled) return;

        const nextProgressMap = rows.reduce((acc, item) => {
          const key = normalizeGameKey(item.juego);
          if (ATENCION_KEYS.includes(key)) {
            acc[key] = item;
          }
          return acc;
        }, {});
        setProgressMap(nextProgressMap);
      } catch (_error) {
        if (!cancelled) setProgressMap({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    cargarDatos();
    return () => { cancelled = true; };
  }, []);

  const summary = useMemo(() => {
    const rows = ATENCION_KEYS.map((key) => progressMap[key]).filter(Boolean);
    const partidasTotales = rows.reduce((acc, item) => acc + Number(item.partidas_jugadas || 0), 0);
    const totalAciertosEstimados = rows.reduce(
      (acc, item) => acc + (Number(item.promedio_puntuacion || 0) * Number(item.partidas_jugadas || 0)),
      0
    );
    const accuracy = partidasTotales > 0
      ? Math.round((totalAciertosEstimados / (partidasTotales * 10)) * 100)
      : 0;

    const latestRow = rows.reduce((latest, item) => {
      if (!latest) return item;
      const latestDate = new Date(latest.ultima_fecha || 0).getTime();
      const currentDate = new Date(item.ultima_fecha || 0).getTime();
      return currentDate > latestDate ? item : latest;
    }, null);

    return {
      hasData: rows.length > 0,
      partidasTotales,
      accuracy,
      ultimoResultado: latestRow?.ultimo_resultado || '0/10',
      mejorPuntuacion: `${Math.max(...rows.map((item) => Number(item.mejor_puntuacion || 0)), 0)}/10`,
    };
  }, [progressMap]);

  const accuracyIsGood = summary.accuracy > 25;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={juegosStyles.headerRow}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Atención Visual</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Selector de Niveles */}
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={styles.menuCard}
            activeOpacity={0.85}
            onPress={() => onSelectDifficulty(level.id)}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: level.color }]}>
              <MaterialCommunityIcons name={level.icon} size={30} color={level.iconColor} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.menuTitle}>{level.title}</Text>
              <Text style={styles.menuSubtitle}>{level.description}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
          </TouchableOpacity>
        ))}

        {/* Sección de Progreso */}
        {loading ? (
          <View style={[styles.settingsCard, { padding: 40, alignItems: 'center' }]}>
            <ActivityIndicator color="#10B981" />
          </View>
        ) : !summary.hasData ? (
          <View style={[styles.settingsCard, { alignItems: 'center', padding: 20 }]}>
            <MaterialCommunityIcons name="chart-box-outline" size={40} color="#CBD5E1" />
            <Text style={[styles.sectionTitle, { textAlign: 'center', marginTop: 10 }]}>Tu progreso en atención</Text>
            <Text style={[styles.menuSubtitle, { textAlign: 'center' }]}>
              Cuando juegues partidas, aquí verás tu rendimiento global.
            </Text>
          </View>
        ) : (
          <View style={styles.settingsCard}>
            <Text style={[styles.sectionTitle, {marginLeft:0}]}>Resumen rápido</Text>
            <Text style={styles.menuSubtitle}>Tu resumen global de atención.</Text>

            {/* Fila 1: Aciertos y Partidas */}
            <View style={juegosStyles.statsRow}>
              <View style={[
                juegosStyles.cardBase, 
                accuracyIsGood ? juegosStyles.cardAccuracyGood : juegosStyles.cardAccuracyBad
              ]}>
                <MaterialCommunityIcons 
                  name="percent-outline" 
                  size={24} 
                  color={accuracyIsGood ? '#16A34A' : '#DC2626'} 
                />
                <Text style={[styles.menuSubtitle, juegosStyles.statTitle]}>% de aciertos</Text>
                <Text style={[juegosStyles.statNumberLarge, { fontSize: aplicarEscala(24) }]}>
                  {summary.accuracy}%
                </Text>
              </View>

              <View style={[juegosStyles.cardBase, juegosStyles.cardNeutral]}>
                <MaterialCommunityIcons name="counter" size={24} color="#4D6BFE" />
                <Text style={[styles.menuSubtitle, juegosStyles.statTitle]}>Partidas</Text>
                <Text style={[juegosStyles.statNumberLarge, { fontSize: aplicarEscala(24) }]}>
                  {summary.partidasTotales}
                </Text>
              </View>
            </View>

            {/* Fila 2: Última y Mejor puntuación */}
            <View style={juegosStyles.statsRowSmall}>
              <View style={[juegosStyles.cardBase, juegosStyles.cardNeutral]}>
                <MaterialCommunityIcons name="clock-outline" size={22} color="#4D6BFE" />
                <Text style={[styles.menuSubtitle, juegosStyles.statTitle]}>Última partida</Text>
                <Text style={[juegosStyles.statNumberSmall, { fontSize: aplicarEscala(20) }]}>
                  {summary.ultimoResultado}
                </Text>
              </View>

              <View style={[juegosStyles.cardBase, juegosStyles.cardWarning]}>
                <MaterialCommunityIcons name="trophy-outline" size={22} color="#F97316" />
                <Text style={[styles.menuSubtitle, juegosStyles.statTitle]}>Mejor score</Text>
                <Text style={[juegosStyles.statNumberSmall, { fontSize: aplicarEscala(20) }]}>
                  {summary.mejorPuntuacion}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}