import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';
import { progresoJuegosService } from '../../../services/progresoJuegosService';

const AREAS = [
  { id: 'memoria', title: 'Memoria', icon: 'brain', color: '#E1E7FF', iconColor: '#4D6BFE' },
  { id: 'orientacion', title: 'Orientación', icon: 'compass-outline', color: '#F3E8FF', iconColor: '#A855F7' },
  { id: 'visual', title: 'Visual', icon: 'eye-outline', color: '#DCFCE7', iconColor: '#16A34A' },
  { id: 'atencion', title: 'Atención', icon: 'target', color: '#FEF3C7', iconColor: '#F59E0B' },
  { id: 'ejecutivas', title: 'Funciones Ejecutivas', icon: 'calculator', color: '#FFEDD5', iconColor: '#F97316' },
  { id: 'lenguaje', title: 'Lenguaje', icon: 'chat-outline', color: '#FCE7F3', iconColor: '#DB2777' },
];

export default function GestionarProgresoJuegosPaciente({ route, navigation }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const { paciente } = route.params;
  const pacienteId = paciente?.uid || paciente?.id;

  const [progresoGlobal, setProgresoGlobal] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);

  const cargarProgreso = useCallback(async () => {
    if (!pacienteId) return;
    setCargando(true);
    try {
      const response = await progresoJuegosService.obtenerProgresoPorPaciente(pacienteId);
      setProgresoGlobal(response?.progreso || []);
    } catch (error) {
      console.error("Error al cargar progreso:", error);
      Alert.alert('Error', 'No se pudo conectar con el historial.');
    } finally {
      setCargando(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    cargarProgreso();
  }, [cargarProgreso]);

  const juegosFiltrados = useMemo(() => {
    if (!areaSeleccionada || !progresoGlobal) return [];
    return progresoGlobal.filter(item => {
      if (!item?.categoria) return false;
      return item.categoria.toLowerCase() === areaSeleccionada.id.toLowerCase();
    });
  }, [progresoGlobal, areaSeleccionada]);

  const formatNombreCompleto = (name) => {
    if (!name || typeof name !== 'string') return 'Actividad General';
    
    const nombresJuegos = {
      'memoria': 'Memoria Numérica',
      'memoria_musical': 'Memoria Musical',
      'atencion': 'Atencion',
      'atencion_reaccion': 'Caza al ratón',
      'trivia': 'Trivia',
      'orientacion': 'Orientacion',
      'calculadora': 'Cálculo Mental',
      'visual': 'Visual'
    };

    const parts = name.split('_');
    
    if (parts.length === 1) {
      return nombresJuegos[name] || name.charAt(0).toUpperCase() + name.slice(1);
    }

    const dificultad = parts.pop();
    const nombreBase = parts.join('_');

    const nombreBonito = nombresJuegos[nombreBase] || nombreBase.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const dificultadBonita = dificultad.charAt(0).toUpperCase() + dificultad.slice(1);

    return `${nombreBonito}: ${dificultadBonita}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => areaSeleccionada ? setAreaSeleccionada(null) : navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>
            {areaSeleccionada ? areaSeleccionada.title : 'Rendimiento'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View style={{ paddingTop: 10, paddingBottom: 20 }}>
          <Text style={{ color: '#64748B', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
            {areaSeleccionada 
              ? `Estadísticas de ${paciente?.nombre} en ${areaSeleccionada.title}.`
              : `Selecciona un área para revisar el progreso de ${paciente?.nombre}.`}
          </Text>
        </View>

        {cargando ? (
          <View style={{ marginTop: 40 }}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : !areaSeleccionada ? (
          <View>
            {AREAS.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={styles.menuCard}
                onPress={() => setAreaSeleccionada(area)}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: area.color }]}>
                  <MaterialCommunityIcons name={area.icon} size={28} color={area.iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuTitle}>{area.title}</Text>
                  <Text style={styles.menuSubtitle}>Aciertos y frecuencia de juego</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            {juegosFiltrados.length > 0 ? (
              juegosFiltrados.map((item, index) => (
                <View key={index} style={[styles.settingsCard, { marginBottom: 15, padding: 15 }]}>
                  <Text style={[styles.menuTitle, { color: '#1E293B', marginBottom: 15, fontSize: aplicarEscala(16) }]}>
                    {formatNombreCompleto(item.juego)}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ color: '#64748B', fontSize: 11 }}>Partidas</Text>
                      <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{item.partidas_jugadas}</Text>
                    </View>

                    <View style={{ alignItems: 'center', flex: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F1F5F9' }}>
                      <Text style={{ color: '#64748B', fontSize: 11 }}>Mejor</Text>
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#16A34A' }}>
                        {item.ultimo_resultado ? item.ultimo_resultado.split(' ')[0] : item.mejor_puntuacion}
                      </Text>
                    </View>

                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ color: '#64748B', fontSize: 11 }}>Promedio</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#6366F1' }}>
                          {Number(item.promedio_puntuacion || 0).toFixed(1)}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: 'bold' }}>
                          {item.ultimo_resultado?.includes('/') 
                            ? `/${item.ultimo_resultado.split('/')[1].split(' ')[0]}` 
                            : '/10'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={{ alignItems: 'center', marginTop: 60 }}>
                <MaterialCommunityIcons name="clipboard-text-search-outline" size={70} color="#E2E8F0" />
                <Text style={{ color: '#94A3B8', marginTop: 15, textAlign: 'center' }}>
                  No hay datos registrados aún para esta área.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}