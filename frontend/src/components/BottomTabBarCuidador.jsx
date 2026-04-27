import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getStyles } from '../style/styles';
import { useAccesibilidad } from '../services/accesibilidadContext';

export default function BottomTabBar() {
  const { aplicarEscala, isDarkMode, colors } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDarkMode);
  
  const navigation = useNavigation();
  const route = useRoute();

  const tabs = [
    { name: 'DashboardCuidador', label: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
    { name: 'RecordatoriosCuidador', label: 'Recordatorios', icon: 'bell-outline', activeIcon: 'bell' },
    { name: 'ChatBotCuidador', label: 'Asistente', icon: 'chat-outline', activeIcon: 'chat' },
    { name: 'GestionarPacientes', label: 'Gestionar', icon: 'account-group-outline', activeIcon: 'account-group-outline' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = route.name === tab.name;
        return (
          <TouchableOpacity key={tab.name} style={styles.tabItem} onPress={() => navigation.navigate(tab.name)}>
            <MaterialCommunityIcons name={active ? tab.activeIcon : tab.icon} size={24} color={active ? colors.text : colors.inactive} />
            <Text style={[styles.tabText, active && { color: colors.text, fontWeight: 'bold' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
