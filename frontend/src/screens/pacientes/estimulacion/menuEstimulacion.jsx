import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
// Importamos los insets para manejar el notch y el espacio inferior
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomTabBar from '../../../components/BottomTabBar';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

export default function MenuEstimulacion({ onBack, onSelectActivity }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  
  // Hook para obtener los espacios seguros del dispositivo
  const insets = useSafeAreaInsets();

  const ActivityCard = ({ title, icon, color, iconColor, label, onPress }) => (
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* CABECERA CON PADDING DINÁMICO SEGÚN EL NOTCH */}
      <View style={[
        styles.topBar, 
        { paddingTop: insets.top }
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack}>
              <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Actividades</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[ styles.scrollContent ]} 
        showsVerticalScrollIndicator={false}
      >
        {/* REJILLA DE ACTIVIDADES */}
        <View style={styles.grid}>
          <ActivityCard 
            title="Arte" 
            icon="palette" 
            label="Creativo"
            color="#FEE2E2" 
            iconColor="#EF4444" 
            onPress={() => onSelectActivity('Arte')} 
          />
          <ActivityCard 
            title="Música" 
            icon="music-note" 
            label="Relajante"
            color="#E0E7FF" 
            iconColor="#6366F1" 
            onPress={() => onSelectActivity('Musica')} 
          />
          <ActivityCard 
            title="Escritura" 
            icon="pencil-box-outline" 
            label="Mental"
            color="#FEF3C7" 
            iconColor="#D97706" 
            onPress={() => onSelectActivity('Escritura')} 
          />
          <ActivityCard 
            title="Lectura" 
            icon="book-open-variant" 
            label="Foco"
            color="#D1FAE5" 
            iconColor="#10B981" 
            onPress={() => onSelectActivity('Lectura')} 
          />
        </View>

        {/* PANEL DE INFORMACIÓN */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconCircle}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Sugerencia del día</Text>
            <Text style={styles.infoText}>
              "Escuchar música suave ayuda a mejorar el estado de ánimo y la relajación profunda."
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}