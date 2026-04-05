import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomTabBar from '../../../components/BottomTabBar';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

export default function MenuJuegos({ onBack, onSelectGame }) {
  const { aplicarEscala } = useAccesibilidad();
  const styles = getStyles(aplicarEscala);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Encabezado con flecha de volver */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#334155" />
          </TouchableOpacity>
          <Text style={[styles.brandName, { marginLeft: 10 }]}>Juegos Cognitivos</Text>
        </View>

        <View style={styles.grid}>
          <GameCard title="Memoria" icon="brain" color="#FDF2F8" iconColor="#EC4899" onPress={() => onSelectGame('Memoria')} />
          <GameCard title="Cálculos" icon="calculator" color="#EFF6FF" iconColor="#3B82F6" onPress={() => onSelectGame('Calculadora')} />
          <GameCard title="Trivia" icon="help-circle" color="#FFFBEB" iconColor="#F59E0B" onPress={() => onSelectGame('Trivia')} />
          <GameCard title="Atención" icon="target" color="#ECFDF5" iconColor="#10B981" onPress={() => onSelectGame('Atencion')} />
        </View>

        {/* Panel de Progreso */}
        <View style={[styles.settingsCard, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>Tu progreso esta semana</Text>
          <View style={[styles.rowSpace, { marginTop: 20 }]}>
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

// Sub-componentes internos para este menú
const GameCard = ({ title, icon, color, iconColor, onPress }) => (
  <TouchableOpacity style={styles.typeCard} onPress={onPress}>
    <View style={[styles.typeIconCircle, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
    </View>
    <Text style={styles.typeText}>{title}</Text>
  </TouchableOpacity>
);

const StatItem = ({ label, value, color }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: color }}>{value}</Text>
    <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{label}</Text>
  </View>
);