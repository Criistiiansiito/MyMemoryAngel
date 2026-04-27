import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import BottomTabBar from '../../components/BottomTabBarCuidador';
import { useCurrentDate } from '../../hooks/useCurrentDate';
import { formatMadridDate, toMadridDateOnly } from '../../utils/dateMadrid';

import {
  fetchRecordatorios,
  fetchRecordatoriosHoyPorUsuario,
  getStoredUser,
  getIconConfig,
  formatearFechaYHora,
  marcarRecordatorioCumplido,
  parseMySQLDateTime,
} from '../../services/recordatoriosService';
import { gestionPacientesService } from '../../services/gestionPacientesService';

export default function Recordatorios({ navigation }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();
  const currentDate = useCurrentDate();
  const todayLabel = formatMadridDate(currentDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayKey = toMadridDateOnly(currentDate);

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const usuario = await getStoredUser();
      const propios = await fetchRecordatorios();

      let listaFinal = [];
      if (propios.ok) {
        listaFinal = (propios.data || []).map((item) => ({
          ...item,
          origen_nombre: 'Mis recordatorios',
          origen_uid: usuario?.uid || null,
        }));
      }

      const pacientesRes = await gestionPacientesService.listarMisPacientes();
      if (pacientesRes.ok && Array.isArray(pacientesRes.pacientes)) {
        const resultadosPacientes = await Promise.all(
          pacientesRes.pacientes.map(async (paciente) => {
            const result = await fetchRecordatoriosHoyPorUsuario(paciente.uid);
            if (!result.ok) return [];

            return (result.data || []).map((item) => ({
              ...item,
              origen_nombre: paciente.nombre || 'Paciente vinculado',
              origen_uid: paciente.uid,
            }));
          })
        );

        listaFinal = [...listaFinal, ...resultadosPacientes.flat()];
      }

      listaFinal.sort((a, b) => parseMySQLDateTime(a.fecha_hora) - parseMySQLDateTime(b.fecha_hora));
      setReminders(listaFinal);
    } catch (_error) {
      Alert.alert('Error', 'No se pudieron obtener los recordatorios.');
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  useEffect(() => {
    cargarDatos();
  }, [todayKey]);

  const toggleCumplido = async (item) => {
    try {
      setUpdatingId(item.id_recordatorio);
      const nextCumplido = !item.cumplido;
      await marcarRecordatorioCumplido(item.id_recordatorio, nextCumplido, item.fecha_ocurrencia);
      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id_recordatorio === item.id_recordatorio
            ? { ...reminder, cumplido: nextCumplido ? 1 : 0 }
            : reminder
        )
      );
    } catch (_error) {
      Alert.alert('Error', 'No se pudo actualizar el estado del recordatorio.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.headerActions}>
          <Text style={styles.brandName}>Recordatorios</Text>
          <View style={styles.headerButtonsGroup}>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('CalendarioCuidador')}>
              <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#8B5CF6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('GestionarRecordatorios')}>
              <MaterialCommunityIcons name="playlist-edit" size={24} color="#8B5CF6" />
            </TouchableOpacity>            
            <TouchableOpacity
              style={[styles.headerIconButton, { backgroundColor: '#334155' }]}
              onPress={() => navigation.navigate('NuevoRecordatorio')}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: 0 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.dateHeaderContainer}>
          <Text style={styles.dateText}>
            {todayLabel}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4D6BFE" style={styles.centeredLoader} />
        ) : reminders.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="bell-off-outline" size={60} color="#CBD5E0" />
            <Text style={styles.emptyStateText}>No hay recordatorios registrados</Text>
          </View>
        ) : (
          reminders.map((item) => {
            const config = getIconConfig(item.tipo);
            const { fecha, hora } = formatearFechaYHora(item.fecha_hora);

            return (
              <TouchableOpacity
                key={item.id_recordatorio}
                style={[styles.menuCard, item.cumplido && styles.menuCardCompleted]}
                activeOpacity={0.85}
                onPress={() => toggleCumplido(item)}
                disabled={updatingId === item.id_recordatorio}
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
                      {item.cumplido ? (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedCheck}>✓</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={[styles.menuTitle, {fontSize: aplicarEscala(16)}]}>{item.titulo}</Text>

                    {item.descripcion && item.descripcion.trim().length > 0 ? (
                      <Text style={styles.menuSubtitle}>{item.descripcion}</Text>
                    ) : null}

              
                    {item.origen_nombre ? (
                      <View style={[styles.reminderFooterRow, { marginTop: 6 }]}>
                        <MaterialCommunityIcons name="account-outline" size={14} color="#64748B" />
                        <Text style={[styles.typeTabText, { marginLeft: 6 }]}>{item.origen_nombre}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <View style={[styles.reminderActionButton, { width: 30, height: 30 }]}>
                  {updatingId === item.id_recordatorio ? (
                    <ActivityIndicator size="small" color="#16A34A" />
                  ) : (
                    <MaterialCommunityIcons
                      name={item.cumplido ? 'check-circle' : 'check-circle-outline'}
                      size={28}
                      color={item.cumplido ? '#16A34A' : '#94A3B8'}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View>
        <BottomTabBar />
      </View>
    </View>
  );
}
