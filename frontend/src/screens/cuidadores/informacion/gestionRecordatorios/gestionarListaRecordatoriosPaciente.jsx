import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

import { getStyles } from '../../../../style/styles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';
import { getIconConfig, formatearFechaYHora } from '../../../../services/recordatoriosService';

const API =
  Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

const formatRecurrencia = (recurrencia = 'puntual') => {
  const value = recurrencia.toLowerCase();
  if (value === 'diaria') return 'Diaria';
  if (value === 'semanal') return 'Semanal';
  if (value === 'mensual') return 'Mensual';
  return 'Puntual';
};

export default function GestionarListaRecordatoriosPaciente({ route, navigation }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();
  const { paciente } = route.params;

  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarRecordatorios = useCallback(async () => {
    if (!paciente?.uid) {
      setRecordatorios([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API}/auth/recordatorios/${paciente.uid}`);
      setRecordatorios(response.data.recordatorios || []);
    } catch (error) {
      console.error('Error cargando recordatorios del paciente:', error);
      setRecordatorios([]);
    } finally {
      setLoading(false);
    }
  }, [paciente?.uid]);

  useFocusEffect(
    useCallback(() => {
      cargarRecordatorios();
    }, [cargarRecordatorios])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Gestionar Recordatorios</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View style={{ paddingTop: 10, paddingBottom: 20 }}>
          <Text style={{ color: '#64748B', fontSize: 14, lineHeight: 22, textAlign: 'center' }}>
            Revisa los recordatorios de {paciente?.nombre} y entra en cada uno para modificarlo o eliminarlo.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#4D6BFE" style={{ marginTop: 40 }} />
        ) : recordatorios.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="bell-off-outline" size={50} color="#CBD5E0" />
            <Text style={styles.emptyStateText}>Este paciente no tiene recordatorios guardados</Text>
          </View>
        ) : (
          recordatorios.map((item) => {
            const config = getIconConfig(item.tipo);
            const { fecha, hora } = formatearFechaYHora(item.fecha_hora);

            return (
              <TouchableOpacity
                key={item.id_recordatorio}
                style={styles.menuCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ModificarRecordatorio', { recordatorio: item })}
              >
                <View style={styles.reminderCardContent}>
                  <View style={[styles.menuIconContainer, { backgroundColor: config.color }]}>
                    <MaterialCommunityIcons name={config.icon} size={30} color={config.iconColor} />
                  </View>

                  <View style={styles.reminderInfoBody}>
                    <View style={styles.reminderTopRow}>
                      <View style={styles.timeBadge}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#4D6BFE" />
                        <Text style={styles.timeBadgeText}>{fecha} | {hora}</Text>
                      </View>
                    </View>

                    <Text style={[styles.menuTitle, {fontSize: aplicarEscala(14)}]}>{item.titulo}</Text>

                    {item.descripcion ? (
                      <Text style={[styles.menuSubtitle, { fontSize: aplicarEscala(10) }]}>{item.descripcion}</Text>
                    ) : null}

                    <View style={styles.reminderFooterRow}>
                      <View style={[styles.typeDot, { backgroundColor: config.iconColor }]} />
                      <Text style={styles.typeTabText}>{item.tipo + '   |   '}</Text>
                      <Text style={styles.typeTabText}>
                        {formatRecurrencia(item.recurrencia)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.reminderActionButton, { width: 35, height: 35 }]}>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
