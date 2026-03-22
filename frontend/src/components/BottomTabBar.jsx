import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from '../style/styles';

export default function BottomTabBar() {
  const navigation = useNavigation();
  const route = useRoute();

  const tabs = [
    { name: 'DashboardPaciente', label: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
    { name: 'Recordatorios', label: 'Recordatorios', icon: 'bell-outline', activeIcon: 'bell' },
    { name: 'ChatBot', label: 'Asistente', icon: 'chat-outline', activeIcon: 'chat' },
    { name: 'Actividades', label: 'Cerebro', icon: 'brain', activeIcon: 'brain' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = route.name === tab.name;
        return (
          <TouchableOpacity key={tab.name} style={styles.tabItem} onPress={() => navigation.navigate(tab.name)}>
            <MaterialCommunityIcons name={active ? tab.activeIcon : tab.icon} size={24} color={active ? '#334155' : '#94A3B8'} />
            <Text style={[styles.tabText, active && { color: '#334155', fontWeight: 'bold' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}