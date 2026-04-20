import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image, StatusBar } from 'react-native';
// Importamos useSafeAreaInsets para control total sobre los espacios de iOS
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import { configuracionPerfil } from '../../services/configuracionPerfil';
import BottomTabBar from '../../components/BottomTabBar';

import axios from 'axios';
import { getAuth } from 'firebase/auth';

export default function DashboardPaciente({ navigation }) {
  const [nombreUsuario, setNombreUsuario] = useState('Paciente'); 
  const [fotoPerfil, setFotoPerfil] = useState(null); 
  const [loading, setLoading] = useState(true);
  
  // Hook para obtener los tamaños de los bordes (notch, barra de estado)
  const insets = useSafeAreaInsets();

  const fechaHoy = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  const { aplicarEscala, cargarDesdeServidor, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);

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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4D6BFE" />
      </View>
    );
  }

  const enviarPushTest = async () => {
  try {
    const auth = getAuth();
    const firebaseToken = await auth.currentUser.getIdToken();

    const res = await axios.post(
      'http://172.20.10.5:5000/api/auth/test-push',
      {},
      {
        headers: {
          Authorization: `Bearer ${firebaseToken}`
        }
      }
    );

    console.log('PUSH OK:', res.data);

  } catch (error) {
    console.log('ERROR PUSH:', error.response?.data || error.message);
  }
};

  return (
    // Quitamos el SafeAreaView de afuera para que el color de fondo llegue hasta arriba
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER PERSONALIZADO */}
      <View style={[styles.topBar, { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }]}>
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
            <TouchableOpacity style={styles.headerIconButton}>
              <MaterialCommunityIcons name="volume-high" size={24} color="#334155" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerIconButton} 
              onPress={() => navigation.navigate('ConfiguracionPaciente')}
            >
              <MaterialCommunityIcons name="cog-outline" size={24} color="#334155" />
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* CUERPO */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20}}>
        
        <View style={styles.dateHeaderContainer}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>   

        <TouchableOpacity 
  style={{
    backgroundColor: '#4D6BFE',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }}
  onPress={enviarPushTest}
>
  <MaterialCommunityIcons name="bell-ring" size={22} color="white" />
  <Text style={{ color: 'white', marginLeft: 10, fontWeight: 'bold' }}>
    Enviar push de prueba
  </Text>
</TouchableOpacity>       

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