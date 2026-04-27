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
    id: 'calculadora_facil',
    title: 'Nivel Básico',
    description: 'Sumas y restas sencillas.',
    icon: 'circle-outline',
    color: '#EFF6FF',
    iconColor: '#3B82F6',
  },
  {
    id: 'calculadora_medio',
    title: 'Nivel Intermedio',
    description: 'Operaciones más complicadas.',
    icon: 'circle-half-full',
    color: '#EFF6FF',
    iconColor: '#3B82F6',
  },
  {
    id: 'calculadora_dificil',
    title: 'Nivel Avanzado',
    description: 'Cálculo con números mayores.',
    icon: 'checkbox-blank-circle',
    color: '#EFF6FF',
    iconColor: '#3B82F6',
  },
];

const CALCULADORA_KEYS = ['calculadora_facil', 'calculadora_medio', 'calculadora_dificil'];

const normalizeGameKey = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default function NivelesCalculadora({ onBack, onSelectDifficulty }) {
  const { aplicarEscala, isDarkMode } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDarkMode);
  const juegosStyles = getJuegosStyles(aplicarEscala, isDarkMode);
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
          if (CALCULADORA_KEYS.includes(key)) {
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
    const rows = CALCULADORA_KEYS.map((key) => progressMap[key]).filter(Boolean);
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

  const accuracyIsGood = summary.accuracy > 50;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Cálculo Mental</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        {loading ? (
          <View style={[styles.settingsCard, { marginTop: 8, alignItems: 'center', paddingVertical: 24 }]}>
            <ActivityIndicator color="#0EA5E9" />
          </View>
        ) : !summary.hasData ? (
          <View style={[styles.settingsCard, { marginTop: 8, alignItems: 'center', paddingVertical: 24 }]}>
            <MaterialCommunityIcons name="chart-box-outline" size={40} color="#CBD5E1" />
            <Text style={[styles.sectionTitle, { marginTop: 12, textAlign: 'center' }]}>Tu progreso en Cálculo</Text>
            <Text style={[styles.menuSubtitle, { marginTop: 8, textAlign: 'center', paddingHorizontal: 10 }]}>
              Cuando juegues partidas, aquí verás el porcentaje de aciertos, las partidas jugadas y tu rendimiento global.
            </Text>
          </View>
        ) : (
          <View style={[styles.settingsCard, { marginTop: 8 }]}>
            <Text style={[styles.sectionTitle, { marginLeft: 0 }]}>Resumen rápido</Text>
            <Text style={[styles.menuSubtitle, { marginTop: 8, marginBottom: 5 }]}>
              Tu resumen global de agilidad matemática.
            </Text>

            <View style={juegosStyles.statsRow}>
              <View
                style={[
                  juegosStyles.cardBase,
                  accuracyIsGood ? juegosStyles.cardAccuracyGood : juegosStyles.cardAccuracyBad,
                ]}
              >
                <MaterialCommunityIcons
                  name="percent-outline"
                  size={24}
                  color={accuracyIsGood ? '#16A34A' : '#DC2626'}
                />
                <Text style={[styles.menuSubtitle, juegosStyles.statTitle, isDarkMode && { color: '#FFFFFF' }]}>% de aciertos</Text>
                <Text style={[juegosStyles.statNumberLarge, { fontSize: aplicarEscala(24) }, isDarkMode && { color: '#FFFFFF' }]}>
                  {summary.accuracy}%
                </Text>
              </View>

              <View style={[juegosStyles.cardBase, juegosStyles.cardNeutral]}>
                <MaterialCommunityIcons name="counter" size={24} color="#4D6BFE" />
                <Text style={[styles.menuSubtitle, { marginTop: 10, marginBottom: 4 }, isDarkMode && { color: '#000000' }]}>Partidas jugadas</Text>
                <Text style={{ fontSize: aplicarEscala(24), fontWeight: '800', color: isDarkMode ? '#000000' : '#1E293B' }}>
                  {summary.partidasTotales}
                </Text>
              </View>
            </View>

            <View style={juegosStyles.statsRowSmall}>
              <View style={[juegosStyles.cardBase, juegosStyles.cardNeutral]}>
                <MaterialCommunityIcons name="clock-outline" size={22} color="#4D6BFE" />
                <Text style={[styles.menuSubtitle, { marginTop: 10, marginBottom: 4 }, isDarkMode && { color: '#000000' }]}>Última partida</Text>
                <Text style={[juegosStyles.statNumberSmall, { fontSize: aplicarEscala(20) }, isDarkMode && { color: '#000000' }]}>
                  {summary.ultimoResultado}
                </Text>
              </View>

              <View style={[juegosStyles.cardBase, juegosStyles.cardWarning]}>
                <MaterialCommunityIcons name="trophy-outline" size={22} color="#F97316" />
                <Text style={[styles.menuSubtitle, { marginTop: 10, marginBottom: 4 }, isDarkMode && { color: '#FFFFFF' }]}>Mejor puntuación</Text>
                <Text style={{ fontSize: aplicarEscala(20), fontWeight: '800', color: isDarkMode ? '#FFFFFF' : '#1E293B' }}>
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


