import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { getStyles } from '../../../../style/styles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';
import { getIconConfig, formatearFechaYHora } from '../../../../services/recordatoriosService';
import { gestionRecordatoriosPacientesService } from '../../../../services/gestionRecordatoriosPacientes';

const formatDateLabel = (dateString) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  });

const renderEstado = (estado) => {
  if (estado === 'cumplido') {
    return { icon: 'check-circle', color: '#16A34A', text: 'Cumplido' };
  }
  if (estado === 'incumplido') {
    return { icon: 'close-circle', color: '#EF4444', text: 'No cumplido' };
  }
  return { icon: 'progress-clock', color: '#F59E0B', text: 'Pendiente' };
};

export default function HistorialRecordatoriosPaciente({ route, navigation }) {
  const { aplicarEscala, isDarkMode } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDarkMode);
  const insets = useSafeAreaInsets();
  const { paciente } = route.params;

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
      const response = await gestionRecordatoriosPacientesService.obtenerHistorialUltimoMesPaciente(paciente.uid);
      setHistorial(response.historial || []);
    } finally {
      setLoading(false);
    }
  }, [paciente?.uid]);

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
            const config = getIconConfig(item.tipo, isDarkMode);
            const estado = renderEstado(item.estado_calendario);
            const { hora } = formatearFechaYHora(item.fecha_hora);

            return (
              <View key={`${item.id_recordatorio}-${item.fecha_ocurrencia}`} style={styles.menuCard}>
                <View style={[styles.menuIconContainer, { backgroundColor: config.color }]}>
                  <MaterialCommunityIcons name={config.icon} size={28} color={config.iconColor} />
                </View>

                <View style={styles.reminderInfoBody}>
                  <View style={[styles.reminderBadge, { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }]}>
                    <Text style={[styles.reminderBadgeText, {color: '#718096', fontSize: aplicarEscala(12)}]}>
                      {formatDateLabel(item.fecha_ocurrencia)} | {hora}
                    </Text>
                    <Text
                      style={[
                        styles.menuSubtitle,
                        { fontSize: aplicarEscala(12), marginLeft: 10, marginBottom: 0, fontWeight: '700', color: estado.color },
                      ]}
                    >
                      {estado.text}
                    </Text>
                  </View>

                  <Text style={[styles.menuTitle, {fontSize: aplicarEscala(14)}]} numberOfLines={2}>{item.titulo}</Text>
                  <Text style={[styles.menuSubtitle, { fontSize: aplicarEscala(10) }]} numberOfLines={2}>
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
