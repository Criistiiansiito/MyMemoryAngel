import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../../style/styles';
import BottomTabBar from '../../../components/BottomTabBar';

export default function MenuEstimulacion({ onBack, onSelectActivity }) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Encabezado con flecha de volver */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#334155" />
          </TouchableOpacity>
          <Text style={[styles.brandName, { marginLeft: 10 }]}>Actividades</Text>
        </View>

        <View style={styles.grid}>
          <ActivityCard 
            title="Arte" 
            icon="palette" 
            color="#FEE2E2" 
            iconColor="#EF4444" 
            onPress={() => onSelectActivity('Arte')} 
          />
          <ActivityCard 
            title="Música" 
            icon="music-note" 
            color="#E0E7FF" 
            iconColor="#6366F1" 
            onPress={() => onSelectActivity('Musica')} 
          />
          <ActivityCard 
            title="Escritura" 
            icon="pencil-box-outline" 
            color="#FEF3C7" 
            iconColor="#D97706" 
            onPress={() => onSelectActivity('Escritura')} 
          />
          <ActivityCard 
            title="Lectura" 
            icon="book-open-variant" 
            color="#D1FAE5" 
            iconColor="#10B981" 
            onPress={() => onSelectActivity('Lectura')} 
          />
        </View>

        {/* Panel de información o progreso opcional */}
        <View style={[styles.settingsCard, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>Sugerencia del día</Text>
          <Text style={{ color: '#64748B', marginTop: 10, lineHeight: 20 }}>
            Escuchar música suave ayuda a mejorar el estado de ánimo y la relajación.
          </Text>
        </View>
      </ScrollView>
      <BottomTabBar />
    </View>
  );
}

// Sub-componente idéntico al GameCard pero adaptado para Actividades
const ActivityCard = ({ title, icon, color, iconColor, onPress }) => (
  <TouchableOpacity style={styles.typeCard} onPress={onPress}>
    <View style={[styles.typeIconCircle, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
    </View>
    <Text style={styles.typeText}>{title}</Text>
  </TouchableOpacity>
);