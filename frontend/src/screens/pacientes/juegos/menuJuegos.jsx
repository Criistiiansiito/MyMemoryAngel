import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomTabBar from '../../../components/BottomTabBar';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

export default function MenuJuegos({ onBack, onSelectGame }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  
  // Hook para los espacios seguros del dispositivo (Notch)
  const insets = useSafeAreaInsets();

  const GameCard = ({ title, icon, color, iconColor, label, onPress }) => (
    <TouchableOpacity style={styles.typeCard} onPress={onPress}>
      <View style={[styles.typeIconCircle, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={36} color={iconColor} />
      </View>
      <View>
        <Text style={[styles.badgeText, { color: iconColor }]}>{label}</Text>
      </View>
      <Text style={[styles.typeText, { marginTop: 10, fontWeight: '700' }]}>{title}</Text>
    </TouchableOpacity>
  );

  const StatItem = ({ label, value, color }) => (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: aplicarEscala(24), fontWeight: 'bold', color: color }}>{value}</Text>
      <Text style={{ fontSize: aplicarEscala(12), color: '#64748B', marginTop: 4 }}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* CABECERA CON PADDING DINÁMICO SEGÚN EL NOTCH */}
      <View style={[
        styles.topBar, 
        { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack}>
              <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Juegos Cognitivos</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[ styles.scrollContent ]} 
        showsVerticalScrollIndicator={false}
      >
        {/* REJILLA DE JUEGOS */}
        <View style={styles.grid}>
          <GameCard 
            title="Memoria" 
            icon="brain" 
            label="Reto"
            color="#FDF2F8" 
            iconColor="#EC4899" 
            onPress={() => onSelectGame('Memoria')} 
          />
          <GameCard 
            title="Cálculos" 
            icon="calculator" 
            label="Lógica"
            color="#EFF6FF" 
            iconColor="#3B82F6" 
            onPress={() => onSelectGame('Calculadora')} 
          />
          <GameCard 
            title="Trivia" 
            icon="help-circle" 
            label="Saber"
            color="#FFFBEB" 
            iconColor="#F59E0B" 
            onPress={() => onSelectGame('Trivia')} 
          />
          <GameCard 
            title="Atención" 
            icon="target" 
            label="Foco"
            color="#ECFDF5" 
            iconColor="#10B981" 
            onPress={() => onSelectGame('Atencion')} 
          />
        </View>

        {/* PANEL DE PROGRESO (Reutilizando el estilo de tarjeta de configuración) */}
        <View style={[styles.settingsCard, { marginTop: 20, padding: 20 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Tu progreso esta semana</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
            <StatItem label="Completados" value="12" color="#A855F7" />
            <StatItem label="Tiempo" value="45m" color="#3B82F6" />
            <StatItem label="Precisión" value="85%" color="#10B981" />
          </View>
        </View>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}