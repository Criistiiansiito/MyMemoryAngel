import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useFocusEffect } from '@react-navigation/native';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import BottomTabBar from '../../components/BottomTabBar';
import { useCurrentDate } from '../../hooks/useCurrentDate';
import { formatMadridDate } from '../../utils/dateMadrid';

import MenuEstimulacion from './estimulacion/menuEstimulacion';
import MenuJuegos from './juegos/menuJuegos';
import MenuMemoria from './juegos/memoria/menuMemoria';
import NivelesMemoriaNumerica from './juegos/memoria/nivelesMemoriaNumerica';
import NivelesMemoriaMusical from './juegos/memoria/nivelesMemoriaMusical';
import MenuAtencion from './juegos/atencion/menuAtencion';
import NivelesAtencion from './juegos/atencion/nivelesAtencion';
import NivelesAtencionReaccion from './juegos/atencion/nivelesAtencionReaccion';
import NivelesTrivia from './juegos/lenguaje/nivelesTrivia';
import NivelesOrientacion from './juegos/orientacion/nivelesOrientacion';
import NivelesCalculadora from './juegos/funcionesEjecutivas/nivelesCalculadora';
import MenuLenguaje from './juegos/lenguaje/menuLenguaje';
import MenuOrientacion from './juegos/orientacion/menuOrientacion';
import MenuFuncionesEjecutivas from './juegos/funcionesEjecutivas/menuFuncionesEjecutivas';
import MenuVisual from './juegos/visual/menuVisual';

import Musica from './estimulacion/musica';
import Arte from './estimulacion/arte';
import Lectura from './estimulacion/lectura';
import Escritura from './estimulacion/escritura';

import MemoriaNumerica from './juegos/memoria/memoriaNumerica';
import MemoriaMusical from './juegos/memoria/memoriaMusical';
import Calculadora from './juegos/funcionesEjecutivas/calculadora';
import Trivia from './juegos/lenguaje/trivia';
import Atencion from './juegos/atencion/atencion';
import AtencionReaccion from './juegos/atencion/atencionReaccion';
import Orientacion from './juegos/orientacion/orientacion';
import Visual from './juegos/visual/visual';

export default function EstimulacionCognitiva() {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();
  const currentDate = useCurrentDate();
  const todayLabel = formatMadridDate(currentDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const [view, setView] = useState('main');
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedGameMenu, setSelectedGameMenu] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => () => {
    Speech.stop();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        Speech.stop();
        setIsSpeaking(false);
      };
    }, [])
  );

  useEffect(() => {
    const isMainView = view === 'main' && !selectedGame && !selectedGameMenu && !selectedActivity;
    if (!isMainView) {
      Speech.stop();
      setIsSpeaking(false);
    }
  }, [view, selectedGame, selectedGameMenu, selectedActivity]);

  if (selectedGame) {
    if (selectedGame === 'NivelesMemoriaNumerica') {
      return (
        <NivelesMemoriaNumerica
          onBack={() => setSelectedGame(null)}
          onSelectDifficulty={(difficulty) =>
            setSelectedGame({ id: 'MemoriaNumerica', difficulty })
          }
        />
      );
    }

    if (selectedGame === 'NivelesMemoriaMusical') {
      return (
        <NivelesMemoriaMusical
          onBack={() => setSelectedGame(null)}
          onSelectDifficulty={(difficulty) =>
            setSelectedGame({ id: 'MemoriaMusical', difficulty })
          }
        />
      );
    }

    if (selectedGame === 'NivelesAtencion') {
      return (
        <NivelesAtencion
          onBack={() => setSelectedGame(null)}
          onSelectDifficulty={(difficulty) => setSelectedGame({ id: 'Atencion', difficulty })}
        />
      );
    }

    if (selectedGame === 'NivelesAtencionReaccion') {
      return (
        <NivelesAtencionReaccion
          onBack={() => setSelectedGame(null)}
          onSelectDifficulty={(difficulty) => setSelectedGame({ id: 'AtencionReaccion', difficulty })}
        />
      );
    }

    if (selectedGame === 'NivelesTrivia') {
      return (
        <NivelesTrivia
          onBack={() => setSelectedGame(null)}
          onSelectDifficulty={(difficulty) => setSelectedGame({ id: 'Trivia', difficulty })}
        />
      );
    }

    if (selectedGame === 'NivelesOrientacion') {
      return (
        <NivelesOrientacion
          onBack={() => setSelectedGame(null)}
          onSelectDifficulty={(difficulty) => setSelectedGame({ id: 'Orientacion', difficulty })}
        />
      );
    }

        if (selectedGame === 'NivelesCalculadora') {
      return (
        <NivelesCalculadora
          onBack={() => setSelectedGame(null)}
          onSelectDifficulty={(difficulty) => setSelectedGame({ id: 'Calculadora', difficulty })}
        />
      );
    }

    const gameId = typeof selectedGame === 'string' ? selectedGame : selectedGame.id;
    const props = {
      onBack: () =>
        setSelectedGame(
          gameId === 'MemoriaNumerica'
            ? 'NivelesMemoriaNumerica'
            : gameId === 'MemoriaMusical'
              ? 'NivelesMemoriaMusical'
              : gameId === 'Atencion'
                ? 'NivelesAtencion'
                : gameId === 'AtencionReaccion'
                ? 'NivelesAtencionReaccion'
                : gameId === 'Trivia'
                ? 'NivelesTrivia'
                : gameId === 'Orientacion'
                ? 'NivelesOrientacion'
                : gameId === 'Calculadora'
                ? 'NivelesCalculadora'
                : null
        ),
      ...(
        gameId === 'MemoriaNumerica' ||
        gameId === 'MemoriaMusical' ||
        gameId === 'Atencion' ||
        gameId === 'AtencionReaccion' ||
        gameId === 'Trivia' ||
        gameId === 'Orientacion' ||
        gameId === 'Calculadora'
          ? { difficulty: selectedGame.difficulty }
          : {}
      ),
    };

    switch (gameId) {
      case 'MemoriaNumerica':
        return <MemoriaNumerica {...props} />;
      case 'MemoriaMusical':
        return <MemoriaMusical {...props} />;
      case 'Calculadora':
        return <Calculadora {...props} />;
      case 'Trivia':
        return <Trivia {...props} />;
      case 'Atencion':
        return <Atencion {...props} />;
      case 'AtencionReaccion':
        return <AtencionReaccion {...props} />;
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
      onSelectGame: (game) =>
      setSelectedGame(
        game === 'MemoriaNumerica'
          ? 'NivelesMemoriaNumerica'
          : game === 'MemoriaMusical'
            ? 'NivelesMemoriaMusical'
            : game === 'Atencion'
              ? 'NivelesAtencion'
              : game === 'AtencionReaccion'
              ? 'NivelesAtencionReaccion'
              : game === 'Trivia'
              ? 'NivelesTrivia'
              : game === 'Orientacion'
              ? 'NivelesOrientacion'
              : game === 'Calculadora'
              ? 'NivelesCalculadora'
              : game
      ),
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

  const leerResumen = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const mensaje = [
      'Estás en la pantalla de estimulación cognitiva.',
      'Aquí encontrarás dos bloques principales.',
      'Actividades, donde podrás escuchar música, leer, escribir tu propio diario, incluso divertirte dibujando.',
      'Y por otro lado juegos, con seis áreas cognitivas: memoria, atención, lenguaje, orientación, funciones ejecutivas y visual.',
      'También tienes un consejo del día para animarte a practicar.',
    ].join(' ');

    setIsSpeaking(true);
    Speech.speak(mensaje, {
      language: 'es-ES',
      pitch: 1,
      rate: 0.8,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const renderMainMenu = () => (
    <View style={{ flex: 1 }}>
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top },
        ]}
      >
        <View style={styles.headerActions}>
          <Text style={styles.brandName}>Estimulación</Text>
          <View style={styles.headerButtonsGroup}>
            <TouchableOpacity style={styles.headerIconButton} onPress={leerResumen}>
              <MaterialCommunityIcons name={isSpeaking ? 'stop' : 'volume-high'} size={24} color="#334155" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100, paddingTop: 0 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateHeaderContainer}>
          <Text style={styles.dateText}>{todayLabel}</Text>
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