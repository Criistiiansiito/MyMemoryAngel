import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
// Importamos el hook y quitamos el componente SafeAreaView de la renderización
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getStyles } from '../../style/styles'; 
import { useAccesibilidad } from '../../services/accesibilidadContext';
import BottomTabBar from '../../components/BottomTabBarCuidador';

import { 
  fetchRecordatorios, 
  getIconConfig, 
  formatearFechaYHora 
} from '../../services/recordatoriosService';

export default function Recordatorios({ navigation }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  
  // Hook para los espacios seguros (Notch de iOS)
  const insets = useSafeAreaInsets();

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    setLoading(true);
    const result = await fetchRecordatorios();
    if (result.ok) {
      setReminders(result.data);
    } else if (result.status !== 404) {
      Alert.alert("Error", "No se pudieron obtener los recordatorios.");
    } else {
      setReminders([]);
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

      {/* CABECERA CON PADDING DINÁMICO */}
      <View style={[
        styles.topBar, 
        { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }
      ]}>
        <View style={styles.headerActions}>
          <Text style={styles.brandName}>Recordatorios</Text>
          <View style={styles.headerButtonsGroup}>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('Calendario')}>
              <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#8B5CF6" />
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

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: 0,}]} showsVerticalScrollIndicator={false}>
        <View style={styles.dateHeaderContainer}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
                onPress={() => navigation.navigate('ModificarRecordatorio', { recordatorio: item })}
              >
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

                  <Text style={styles.menuTitle}>{item.titulo}</Text>
                  
                  {item.descripcion && item.descripcion.trim().length > 0 ? (
                    <Text style={styles.menuSubtitle}>{item.descripcion}</Text>
                  ) : null}

                  <View style={styles.reminderFooterRow}>
                    <View style={[styles.typeDot, { backgroundColor: config.iconColor }]} />
                    <Text style={styles.typeTabText}>{item.tipo}</Text>
                  </View>
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