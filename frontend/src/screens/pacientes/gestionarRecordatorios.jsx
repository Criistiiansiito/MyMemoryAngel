import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import { fetchAllRecordatorios, formatearFechaYHora, getIconConfig } from '../../services/recordatoriosService';

const formatRecurrencia = (recurrencia = 'puntual') => {
  const value = recurrencia.toLowerCase();
  if (value === 'diaria') return 'Diaria';
  if (value === 'semanal') return 'Semanal';
  if (value === 'mensual') return 'Mensual';
  return 'Puntual';
};

export default function GestionarRecordatorios({ navigation }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    setLoading(true);
    const result = await fetchAllRecordatorios();
    if (result.ok) {
      setRecordatorios(result.data);
    } else if (result.status !== 404) {
      Alert.alert('Error', 'No se pudieron obtener los recordatorios.');
    } else {
      setRecordatorios([]);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Gestionar recordatorios</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: 15 }]} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#4D6BFE" style={styles.centeredLoader} />
        ) : recordatorios.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="playlist-remove" size={56} color="#CBD5E0" />
            <Text style={styles.emptyStateText}>No hay recordatorios para gestionar</Text>
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

                    <Text style={[styles.menuTitle, { fontSize: aplicarEscala(16) }]}>{item.titulo}</Text>

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

                <View style={[styles.reminderActionButton, { width: 25, height: 25 }]}>
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
