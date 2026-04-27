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
    description: 'Movimientos lentos.',
    icon: 'circle-outline',
    color: '#ECFDF5',
    iconColor: '#10B981',
  },
  {
    id: 'medio',
    title: 'Nivel Medio',
    description: 'Velocidad moderada.',
    icon: 'circle-half-full',
    color: '#ECFDF5',
    iconColor: '#10B981',
  },
  {
    id: 'dificil',
    title: 'Nivel Difícil',
    description: '¡Reflejos rápidos!',
    icon: 'checkbox-blank-circle',
    color: '#ECFDF5',
    iconColor: '#10B981',
  },
];

const REACCION_KEYS = ['atencion_reaccion_facil', 'atencion_reaccion_medio', 'atencion_reaccion_dificil'];

const normalizeGameKey = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default function NivelesAtencionReaccion({ onBack, onSelectDifficulty }) {
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
          if (REACCION_KEYS.includes(key)) {
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
    const rows = REACCION_KEYS.map((key) => progressMap[key]).filter(Boolean);
    const partidasTotales = rows.reduce((acc, item) => acc + Number(item.partidas_jugadas || 0), 0);
    
    const mejorScoreVal = Math.max(...rows.map((item) => Number(item.mejor_puntuacion || 0)), 0);

    const latestRow = rows.reduce((latest, item) => {
      if (!latest) return item;
      const latestDate = new Date(latest.ultima_fecha || 0).getTime();
      const currentDate = new Date(item.ultima_fecha || 0).getTime();
      return currentDate > latestDate ? item : latest;
    }, null);

    return {
      hasData: rows.length > 0,
      partidasTotales,
      ultimoResultado: latestRow?.ultimo_resultado || '0 topos',
      mejorPuntuacion: `${mejorScoreVal} topos`,
    };
  }, [progressMap]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={juegosStyles.headerRow}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Caza al Ratón</Text>
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
            <ActivityIndicator color="#6366F1" />
          </View>
        ) : !summary.hasData ? (
          <View style={[styles.settingsCard, { alignItems: 'center', padding: 20 }]}>
            <MaterialCommunityIcons name="chart-box-outline" size={40} color="#CBD5E1" />
            <Text style={[styles.sectionTitle, { textAlign: 'center', marginTop: 10 }]}>Tu progreso en reflejos</Text>
            <Text style={[styles.menuSubtitle, { textAlign: 'center' }]}>
              Completa una partida para ver tus estadísticas de reacción aquí.
            </Text>
          </View>
        ) : (
          <View style={styles.settingsCard}>
            <Text style={[styles.sectionTitle, {marginLeft:0}]}>Resumen rápido</Text>
            <Text style={styles.menuSubtitle}>Rendimiento global en Caza al Topo.</Text>

            {/* Partidas y Mejor Score */}
            <View style={juegosStyles.statsRow}>
              <View style={[juegosStyles.cardBase, juegosStyles.cardNeutral]}>
                <MaterialCommunityIcons name="counter" size={24} color="#6366F1" />
                <Text style={[styles.menuSubtitle, juegosStyles.statTitle, isDarkMode && { color: '#000000' }]}>Partidas</Text>
                <Text style={[juegosStyles.statNumberLarge, { fontSize: aplicarEscala(24) }, isDarkMode && { color: '#000000' }]}>
                  {summary.partidasTotales}
                </Text>
              </View>

              <View style={[juegosStyles.cardBase, juegosStyles.cardWarning]}>
                <MaterialCommunityIcons name="trophy-outline" size={24} color="#F97316" />
                <Text style={[styles.menuSubtitle, juegosStyles.statTitle, isDarkMode && { color: '#FFFFFF' }]}>Récord</Text>
                <Text style={[juegosStyles.statNumberLarge, { fontSize: aplicarEscala(24) }, isDarkMode && { color: '#FFFFFF' }]}>
                  {summary.mejorPuntuacion}
                </Text>
              </View>
            </View>

            {/* Última puntuación */}
            <View style={juegosStyles.statsRowSmall}>
              <View style={[juegosStyles.cardBase, juegosStyles.cardNeutral, { flex: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="history" size={22} color="#6366F1" />
                    <Text style={[styles.menuSubtitle, juegosStyles.statTitle, { marginLeft: 10 }, isDarkMode && { color: '#000000' }]}>Último resultado</Text>
                </View>
                <Text style={[juegosStyles.statNumberSmall, { fontSize: aplicarEscala(20), marginTop: 5 }, isDarkMode && { color: '#000000' }]}>
                  {summary.ultimoResultado}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

