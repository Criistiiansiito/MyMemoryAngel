import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import BottomTabBar from '../../components/BottomTabBar';

import MenuEstimulacion from './estimulacion/menuEstimulacion';
import MenuJuegos from './juegos/menuJuegos';
import MenuMemoria from './juegos/memoria/menuMemoria';
import MenuAtencion from './juegos/atencion/menuAtencion';
import MenuLenguaje from './juegos/lenguaje/menuLenguaje';
import MenuOrientacion from './juegos/orientacion/menuOrientacion';
import MenuFuncionesEjecutivas from './juegos/funcionesEjecutivas/menuFuncionesEjecutivas';
import MenuVisual from './juegos/visual/menuVisual';

import Musica from './estimulacion/musica';
import Arte from './estimulacion/arte';
import Lectura from './estimulacion/lectura';
import Escritura from './estimulacion/escritura';

import Memoria from './juegos/memoria/memoria';
import Calculadora from './juegos/funcionesEjecutivas/calculadora';
import Trivia from './juegos/lenguaje/trivia';
import Atencion from './juegos/atencion/atencion';
import Orientacion from './juegos/orientacion/orientacion';
import Visual from './juegos/visual/visual';

export default function EstimulacionCognitiva() {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [view, setView] = useState('main');
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedGameMenu, setSelectedGameMenu] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  if (selectedGame) {
    const props = { onBack: () => setSelectedGame(null) };
    switch (selectedGame) {
      case 'Memoria':
        return <Memoria {...props} />;
      case 'Calculadora':
        return <Calculadora {...props} />;
      case 'Trivia':
        return <Trivia {...props} />;
      case 'Atencion':
        return <Atencion {...props} />;
      case 'Orientacion':
        return <Orientacion {...props} />;
      case 'Visual':
        return <Visual {...props} />;
      default:
        return null;
    }
  }

  if (selectedGameMenu) {
    const props = {
      onBack: () => setSelectedGameMenu(null),
      onSelectGame: (game) => setSelectedGame(game),
    };

    switch (selectedGameMenu) {
      case 'Memoria':
        return <MenuMemoria {...props} />;
      case 'Atencion':
        return <MenuAtencion {...props} />;
      case 'Lenguaje':
        return <MenuLenguaje {...props} />;
      case 'Orientacion':
        return <MenuOrientacion {...props} />;
      case 'FuncionesEjecutivas':
        return <MenuFuncionesEjecutivas {...props} />;
      case 'Visual':
        return <MenuVisual {...props} />;
      default:
        return null;
    }
  }

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
      <View
        style={[
          styles.topBar,
          { paddingTop: Platform.OS === 'ios' ? insets.top : 20 },
        ]}
      >
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100, paddingTop: 0 }]}
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
            <Text style={styles.menuSubtitle}>6 áreas cognitivas y sus juegos</Text>
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
          onSelectCategory={(category) => setSelectedGameMenu(category)}
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
