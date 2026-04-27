import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../../../style/styles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';

export default function GestionarRecordatoriosPaciente({ route, navigation }) {
  const { aplicarEscala, isDarkMode } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDarkMode);
  const insets = useSafeAreaInsets();

  const { paciente } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Recordatorios Paciente</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View style={{ paddingTop: 10, paddingBottom: 20 }}>
          <Text style={{ color: isDarkMode ? '#FFFFFF' : '#64748B', fontSize: 14, lineHeight: 22, textAlign: 'center' }}>
            Desde aquí puedes gestionar los recordatorios de {paciente?.nombre}.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('NuevoRecordatorio', { paciente })}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#E1E7FF' }]}>
            <MaterialCommunityIcons name="plus" size={28} color="#4D6BFE" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Añadir recordatorio</Text>
            <Text style={styles.menuSubtitle}>Crear un nuevo recordatorio para el paciente</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('GestionarListaRecordatoriosPaciente', { paciente })}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#F3E8FF' }]}>
            <MaterialCommunityIcons name="playlist-edit" size={28} color="#A855F7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Modificar o eliminar</Text>
            <Text style={styles.menuSubtitle}>Revisar y editar los recordatorios actuales del paciente</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('GestionarHistorialRecordatoriosPaciente', { paciente })}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <MaterialCommunityIcons name="history" size={28} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Historial</Text>
            <Text style={styles.menuSubtitle}>Ver que recordatorios se han completado el último mes</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
