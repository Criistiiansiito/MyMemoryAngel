import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
// Importamos useSafeAreaInsets y eliminamos SafeAreaView de la renderización
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';

// Componentes comunes
import BottomTabBar from '../../components/BottomTabBar';

// Menús secundarios
import MenuEstimulacion from './estimulacion/menuEstimulacion'; 
import MenuJuegos from './juegos/menuJuegos';

// Actividades específicas
import Musica from './estimulacion/musica'; 
import Arte from './estimulacion/arte';
import Lectura from './estimulacion/lectura';
import Escritura from './estimulacion/escritura';

// Mini-juegos
import Memoria from './juegos/memoria';
import Calculadora from './juegos/calculadora';
import Trivia from './juegos/trivia';
import Atencion from './juegos/atencion';

export default function EstimulacionCognitiva() {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  
  // Hook para manejar los espacios seguros en iOS
  const insets = useSafeAreaInsets();

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

  // 2. Lógica para mostrar las Actividades
  if (selectedActivity === 'Musica') {
    return <Musica onBack={() => setSelectedActivity(null)} />;
  }

  if (selectedActivity === 'Arte') {
    return <Arte onBack={() => setSelectedActivity(null)} />;
  } 

  if (selectedActivity === 'Lectura') {
    return <Lectura onBack={() => setSelectedActivity(null)} />;
  } 

  if (selectedActivity === 'Escritura') {
    return <Escritura onBack={() => setSelectedActivity(null)} />;
  } 

  const renderMainMenu = () => (
    <View style={{ flex: 1 }}>
      {/* CABECERA AJUSTADA AL NOTCH */}
      <View style={[
        styles.topBar, 
        { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }
      ]}>
        <View style={styles.headerActions}>
          <Text style={styles.brandName}>Estimulación</Text>
          <View style={styles.headerButtonsGroup}>
            <View style={[styles.headerIconButton, { backgroundColor: '#E8F0FE' }]}>
               <MaterialCommunityIcons name="head-heart" size={24} color="#4D6BFE" />
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100, paddingTop: 0, }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateHeaderContainer}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.menuCard, { height: 120, borderLeftWidth: 0, borderLeftColor: '#F97316' }]}
          onPress={() => setView('actividades')}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#FFEDD5' }]}>
            <MaterialCommunityIcons name="palette-outline" size={35} color="#F97316" />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.menuTitle}>Actividades</Text>
            <Text style={styles.menuSubtitle}>Arte, música y lectura</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuCard, { height: 120, borderLeftWidth: 0, borderLeftColor: '#4D6BFE' }]}
          onPress={() => setView('juegos')}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#E8F0FE' }]}>
            <MaterialCommunityIcons name="controller-classic-outline" size={35} color="#4D6BFE" />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.menuTitle}>Juegos</Text>
            <Text style={styles.menuSubtitle}>Memoria, lógica y atención</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <View style={styles.infoIconCircle}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Consejo del día</Text>
            <Text style={styles.infoText}>
              "Mantener la mente activa es el mejor regalo para tu memoria. ¡Prueba un juego nuevo hoy!"
            </Text>
          </View>
        </View>

      </ScrollView>

      <View>
        <BottomTabBar />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
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
          onSelectActivity={(id) => setSelectedActivity(id)} 
        />
      )}
    </View>
  );
}