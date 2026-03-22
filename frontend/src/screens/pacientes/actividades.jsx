import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../style/styles'; 

// Componentes comunes
import BottomTabBar from '../../components/BottomTabBar';

// Menús secundarios
import MenuEstimulacion from './estimulacion/menuEstimulacion'; 
import MenuJuegos from './juegos/menuJuegos';

// Actividades específicas
import Musica from './estimulacion/musica'; 
import Arte from './estimulacion/arte';

// Mini-juegos
import Memoria from './juegos/memoria';
import Calculadora from './juegos/calculadora';
import Trivia from './juegos/trivia';
import Atencion from './juegos/atencion';

export default function EstimulacionCognitiva() {
  const [view, setView] = useState('main'); 
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // 1. Lógica para mostrar Juegos
  if (selectedGame) {
    const props = { onBack: () => setSelectedGame(null) };
    switch (selectedGame) {
      case 'Memoria': return <Memoria {...props} />;
      case 'Calculadora': return <Calculadora {...props} />;
      case 'Trivia': return <Trivia {...props} />;
      case 'Atencion': return <Atencion {...props} />;
      default: return null;
    }
  }

  // 2. Lógica para mostrar la Actividad de Música
  if (selectedActivity === 'Musica') { // <--- SI SE SELECCIONA MÚSICA
    return <Musica onBack={() => setSelectedActivity(null)} />;
  }

  if (selectedActivity === 'Arte') {
    return <Arte onBack={() => setSelectedActivity(null)} />;
  } 

  const renderMainMenu = () => (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.contentPadding}>
        <Text style={[styles.brandName, { marginBottom: 30, textAlign: 'center', marginTop: 20 }]}>
          Estimulación Cognitiva
        </Text>
        
        <TouchableOpacity 
          style={[styles.menuCard, { height: 120, borderLeftWidth: 6, borderLeftColor: '#F97316' }]}
          onPress={() => setView('actividades')}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#FFEDD5' }]}>
            <MaterialCommunityIcons name="palette-outline" size={35} color="#F97316" />
          </View>
          <View>
            <Text style={styles.menuTitle}>Actividades</Text>
            <Text style={styles.menuSubtitle}>Arte, música y lectura</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuCard, { height: 120, borderLeftWidth: 6, borderLeftColor: '#4D6BFE' }]}
          onPress={() => setView('juegos')}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#E8F0FE' }]}>
            <MaterialCommunityIcons name="controller-classic-outline" size={35} color="#4D6BFE" />
          </View>
          <View>
            <Text style={styles.menuTitle}>Juegos</Text>
            <Text style={styles.menuSubtitle}>Memoria, lógica y atención</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <BottomTabBar />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {view === 'main' && renderMainMenu()}

      {view === 'juegos' && (
        <MenuJuegos 
          onBack={() => setView('main')} 
          onSelectGame={(game) => setSelectedGame(game)} 
        />
      )}

      {view === 'actividades' && (
        <MenuEstimulacion
          onBack={() => setView('main')} 
          onSelectActivity={(id) => setSelectedActivity(id)} // <--- PASA ESTA PROP
        />
      )}
    </SafeAreaView>
  );
}