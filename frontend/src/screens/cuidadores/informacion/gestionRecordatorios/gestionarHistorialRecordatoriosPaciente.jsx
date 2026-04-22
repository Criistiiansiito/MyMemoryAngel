import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

import { getStyles } from '../../../../style/styles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';
import { getIconConfig, formatearFechaYHora } from '../../../../services/recordatoriosService';
import { toMadridDateOnly } from '../../../../utils/dateMadrid';

const API =
  Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

const addDays = (dateString, delta) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + delta);
  return toMadridDateOnly(date);
};

const formatDateLabel = (dateString) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  });

const renderEstado = (estado) => {
  if (estado === 'cumplido') {
    return { icon: 'check-circle', color: '#16A34A', text: 'Completado' };
  }
  if (estado === 'incumplido') {
    return { icon: 'close-circle', color: '#EF4444', text: 'No completado' };
  }
  return { icon: 'progress-clock', color: '#F59E0B', text: 'Pendiente' };
};

export default function HistorialRecordatoriosPaciente({ route, navigation }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();
  const { paciente } = route.params;

  const today = toMadridDateOnly(new Date());
  const from = useMemo(() => addDays(today, -30), [today]);

  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarHistorial = useCallback(async () => {
    if (!paciente?.uid) {
      setHistorial([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API}/auth/recordatorios-calendario/${paciente.uid}`, {
        params: { from, to: today },
      });

      const lista = (response.data.recordatorios || [])
        .filter((item) => item.fecha_ocurrencia && item.fecha_ocurrencia <= today)
        .sort((a, b) => {
          if (a.fecha_ocurrencia === b.fecha_ocurrencia) {
            return new Date(a.fecha_hora) - new Date(b.fecha_hora);
          }
          return a.fecha_ocurrencia < b.fecha_ocurrencia ? 1 : -1;
        });

      setHistorial(lista);
    } catch (error) {
      console.error('Error cargando historial de recordatorios:', error);
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  }, [from, paciente?.uid, today]);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [cargarHistorial])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Historial</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View style={{ paddingTop: 10, paddingBottom: 20 }}>
          <Text style={{ color: '#64748B', fontSize: 14, lineHeight: 22, textAlign: 'center' }}>
            Consulta como ha ido {paciente?.nombre} con sus recordatorios durante el ultimo mes.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#4D6BFE" style={{ marginTop: 40 }} />
        ) : historial.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="history" size={50} color="#CBD5E0" />
            <Text style={styles.emptyStateText}>No hay historial disponible en el ultimo mes</Text>
          </View>
        ) : (
          historial.map((item) => {
            const config = getIconConfig(item.tipo);
            const estado = renderEstado(item.estado_calendario);
            const { hora } = formatearFechaYHora(item.fecha_hora);

            return (
              <View key={`${item.id_recordatorio}-${item.fecha_ocurrencia}`} style={styles.menuCard}>
                <View style={[styles.menuIconContainer, { backgroundColor: config.color }]}>
                  <MaterialCommunityIcons name={config.icon} size={28} color={config.iconColor} />
                </View>

                <View style={styles.reminderInfoBody}>
                  <View style={[styles.reminderBadge, { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }]}>
                    <Text style={styles.reminderBadgeText}>
                      {formatDateLabel(item.fecha_ocurrencia)} | {hora}
                    </Text>
                    <Text
                      style={[
                        styles.menuSubtitle,
                        { marginLeft: 10, marginBottom: 0, fontWeight: '700', color: estado.color },
                      ]}
                    >
                      {estado.text}
                    </Text>
                  </View>

                  <Text style={styles.menuTitle} numberOfLines={2}>{item.titulo}</Text>
                  <Text style={styles.menuSubtitle} numberOfLines={2}>
                    {item.descripcion || 'Sin descripcion'}
                  </Text>
                </View>

                <View style={{ marginLeft: 10, alignSelf: 'center' }}>
                  <MaterialCommunityIcons name={estado.icon} size={22} color={estado.color} />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
