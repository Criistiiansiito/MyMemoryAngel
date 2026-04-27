import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image, StatusBar } from 'react-native';
// Importamos useSafeAreaInsets para control total sobre los espacios de iOS
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useFocusEffect } from '@react-navigation/native';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import { configuracionPerfil } from '../../services/configuracionPerfil';
import BottomTabBar from '../../components/BottomTabBar';
import { useCurrentDate } from '../../hooks/useCurrentDate';
import { formatMadridDate } from '../../utils/dateMadrid';

import axios from 'axios';
import { getAuth } from 'firebase/auth';

export default function DashboardPaciente({ navigation }) {
  const [nombreUsuario, setNombreUsuario] = useState('Paciente'); 
  const [fotoPerfil, setFotoPerfil] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Hook para obtener los tamaños de los bordes (notch, barra de estado)
  const insets = useSafeAreaInsets();
  const currentDate = useCurrentDate();
  const fechaHoy = formatMadridDate(currentDate, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const { aplicarEscala, cargarDesdeServidor, isDarkMode } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDarkMode);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      obtenerPerfil();
    });
    return unsubscribe;
  }, [navigation]);

  const obtenerPerfil = async () => {
    try {
      const res = await configuracionPerfil.obtenerPerfil();
      if (res.ok) {
        const usuario = res.data?.usuario || res.usuario;
        setNombreUsuario(usuario.nombre || 'Paciente');
        if (usuario.foto_perfil) setFotoPerfil(usuario.foto_perfil);
        cargarDesdeServidor(usuario);
      }
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      if (error.response?.status === 401) navigation.replace('InicioSesion');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4D6BFE" />
      </View>
    );
  }

  const leerDashboard = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const mensaje = [
      `Hola ${nombreUsuario}.`,
      `Hoy es ${fechaHoy}.`,
      'Estoy aquí para ayudarte.',
      'Puedes entrar en Recordatorios para ver lo que tienes que hacer hoy.',
      'En Calendario puedes ver fechas importantes.',
      'En Estimulación encontrarás juegos y ejercicios para la memoria.',
      'En Asistente puedes hacer preguntas cuando lo necesites.',
      'Arriba a la derecha tienes un botón para acceder a los ajustes. Desde ahí puedes cambiar tus datos o conectarte con tu cuidador.',
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

  return (
    // Quitamos el SafeAreaView de afuera para que el color de fondo llegue hasta arriba
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER PERSONALIZADO */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={[styles.logoRow]}>
          {/* Contenedor del nombre: Usamos flex: 1 para que ocupe solo el espacio disponible */}
          <View style={[styles.headerUserInfo]}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F0FE', marginRight: 10, overflow: 'hidden', flexShrink: 0 }]}>
              {fotoPerfil ? (
                <Image source={{ uri: fotoPerfil }} style={{ width: '100%', height: '100%' }} resizeMode="cover"/>
              ) : (
                <MaterialCommunityIcons name="account" size={30} color="#334155" />
              )}
            </View>

            <Text style={styles.nombreCuidador} numberOfLines={1} ellipsizeMode="tail">{nombreUsuario}</Text> 
          </View>

          {/* Contenedor de botones: Con flexShrink: 0 evitamos que se compriman */}
          <View style={{ flexDirection: 'row', flexShrink: 0 }}> 
            <TouchableOpacity style={styles.headerIconButton} onPress={leerDashboard}>
              <MaterialCommunityIcons name={isSpeaking ? "stop" : "volume-high"} style={styles.iconosHeaders} size={24} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerIconButton} 
              onPress={() => navigation.navigate('ConfiguracionPaciente')}
            >
              <MaterialCommunityIcons name="cog-outline" style={styles.iconosHeaders} size={24} color="#334155" />
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* CUERPO */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20}}>
        
        <View style={styles.dateHeaderContainer}>
          <Text style={styles.dateText}>{fechaHoy}</Text>
        </View>      

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('Recordatorios')}>
          <View style={[styles.menuIconContainer, { backgroundColor: '#E1E7FF' }]}>
            <MaterialCommunityIcons name="bell-outline" size={28} color="#4D6BFE" />
          </View>
          <View>
            <Text style={styles.menuTitle}>Recordatorios</Text>
            <Text style={styles.menuSubtitle}>Mis tareas del día</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('Calendario')}>
          <View style={[styles.menuIconContainer, { backgroundColor: '#F3E8FF' }]}>
            <MaterialCommunityIcons name="calendar-month-outline" size={28} color="#A855F7" />
          </View>
          <View>
            <Text style={styles.menuTitle}>Calendario</Text>
            <Text style={styles.menuSubtitle}>Ver todos mis eventos</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('Actividades')}>
          <View style={[styles.menuIconContainer, { backgroundColor: '#DCFCE7' }]}>
            <MaterialCommunityIcons name="head-heart" size={28} color="#22C55E" />
          </View>
          <View>
            <Text style={styles.menuTitle}>Estimulación</Text>
            <Text style={styles.menuSubtitle}>Ejercitar la mente</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('ChatBot')}>
          <View style={[styles.menuIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Image 
              source={require('../../../assets/icons/bot-icon.png')} 
              style={{ width: 35, height: 35 }} 
              resizeMode="contain" 
            />
          </View>
          <View>
            <Text style={styles.menuTitle}>Asistente</Text>
            <Text style={styles.menuSubtitle}>Habla conmigo</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
      
      <View >
        <BottomTabBar/>
      </View>

    </View>
  );
}
