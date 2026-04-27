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
    title: 'Nivel Facil',
    description: 'Secuencias de 2 notas.',
    icon: 'circle-outline',
    color: '#FCE7F3',
    iconColor: '#DB2777',
  },
  {
    id: 'medio',
    title: 'Nivel Medio',
    description: 'Secuencias de 3 notas.',
    icon: 'circle-half-full',
    color: '#FCE7F3',
    iconColor: '#DB2777',
  },
  {
    id: 'dificil',
    title: 'Nivel Dificil',
    description: 'Secuencias de 4 notas.',
    icon: 'checkbox-blank-circle',
    color: '#FCE7F3',
    iconColor: '#DB2777',
  },
];

const MEMORY_KEYS = [
  'memoria_musical_facil',
  'memoria_musical_medio',
  'memoria_musical_dificil',
];

const normalizeGameKey = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default function NivelesMemoriaMusical({ onBack, onSelectDifficulty }) {
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
          if (MEMORY_KEYS.includes(key)) {
            acc[key] = item;
          }
          return acc;
        }, {});

        setProgressMap(nextProgressMap);
      } catch (_error) {
        if (!cancelled) {
          setProgressMap({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    cargarDatos();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const rows = MEMORY_KEYS.map((key) => progressMap[key]).filter(Boolean);
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

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Memoria Musical</Text>
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
            <ActivityIndicator color="#DB2777" />
          </View>
        ) : !summary.hasData ? (
          <View style={[styles.settingsCard, { marginTop: 8, alignItems: 'center', paddingVertical: 24 }]}>
            <MaterialCommunityIcons name="chart-box-outline" size={40} color="#CBD5E1" />
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Tu progreso en memoria musical</Text>
            <Text style={[styles.menuSubtitle, { marginTop: 8, textAlign: 'center' }]}>
              Cuando juegues partidas, aqui veras el porcentaje de aciertos, las partidas jugadas y la ultima partida global.
            </Text>
          </View>
        ) : (
          <View style={[styles.settingsCard, { marginTop: 8 }]}>
            <Text style={[styles.sectionTitle, {marginLeft:0}]}>Resumen rapido</Text>
            <Text style={[styles.menuSubtitle, { marginTop: 8, marginBottom: 0 }]}>
              Tu resumen global de memoria musical.
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
                <Text style={[styles.menuSubtitle, juegosStyles.statTitle]}>
                  % de aciertos
                </Text>
                <Text style={[juegosStyles.statNumberLarge, { fontSize: aplicarEscala(24) }]}>
                  {summary.accuracy}%
                </Text>
              </View>

              <View
                style={[
                  juegosStyles.cardBase,
                  juegosStyles.cardNeutral,
                ]}
              >
                <MaterialCommunityIcons name="counter" size={24} color="#4D6BFE" />
                <Text style={[styles.menuSubtitle, { marginTop: 10, marginBottom: 4 }]}>
                  Partidas jugadas
                </Text>
                <Text style={{ fontSize: aplicarEscala(24), fontWeight: '800', color: '#1E293B' }}>
                  {summary.partidasTotales}
                </Text>
              </View>
            </View>

            <View style={juegosStyles.statsRowSmall}>
              <View
                style={[
                  juegosStyles.cardBase,
                  juegosStyles.cardNeutral,
                ]}
              >
                <MaterialCommunityIcons name="clock-outline" size={22} color="#4D6BFE" />
                <Text style={[styles.menuSubtitle, { marginTop: 10, marginBottom: 4 }]}>
                  Ultima partida
                </Text>
                <Text style={[juegosStyles.statNumberSmall, { fontSize: aplicarEscala(20) }]}>
                  {summary.ultimoResultado}
                </Text>
              </View>

              <View
                style={[
                  juegosStyles.cardBase,
                  juegosStyles.cardWarning,
                ]}
              >
                <MaterialCommunityIcons name="trophy-outline" size={22} color="#F97316" />
                <Text style={[styles.menuSubtitle, { marginTop: 10, marginBottom: 4 }]}>
                  Mejor puntuacion
                </Text>
                <Text style={{ fontSize: aplicarEscala(20), fontWeight: '800', color: '#1E293B' }}>
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
