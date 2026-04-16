import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import { configuracionPerfil } from '../../services/configuracionPerfil';
import BottomTabBar from '../../components/BottomTabBarResponsables'; 

export default function DashboardResponsable({ navigation }) {
  const [nombreUsuario, setNombreUsuario] = useState('Responsable');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPacientes, setNumPacientes] = useState(0); 

  const insets = useSafeAreaInsets();
  const { aplicarEscala, cargarDesdeServidor, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);

  const fechaHoy = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

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
        setNombreUsuario(usuario.nombre || 'Responsable');
        if (usuario.foto_perfil) setFotoPerfil(usuario.foto_perfil);
        
        // Suponiendo que el perfil trae una lista de pacientes vinculados
        setNumPacientes(usuario.pacientes_vinculados?.length || 0);
        
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
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER PERSONALIZADO */}
      <View style={[styles.topBar, { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }]}>
        <View style={styles.logoRow}>
          <View style={styles.headerUserInfo}>
            <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF', marginRight: 10, overflow: 'hidden', flexShrink: 0 }]}>
              {fotoPerfil ? (
                <Image source={{ uri: fotoPerfil }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <MaterialCommunityIcons name="account-tie" size={30} color="#6B21A8" />
              )}
            </View>
                <Text style={styles.nombreResponsable } numberOfLines={1} ellipsizeMode="tail">Perfil de Responsable</Text>
          </View>

          <View style={{ flexDirection: 'row', flexShrink: 0}}> 
            <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('Configuracion')}>
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
              
        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('GestionarPacientes')}>
          <View style={[styles.menuIconContainer, { backgroundColor: '#F3E8FF' }]}>
            <MaterialCommunityIcons name="account-group-outline" size={28} color="#A855F7" />
          </View>
          <View>
            <Text style={styles.menuTitle}>Gestion de Pacientes</Text>
            <Text style={styles.menuSubtitle}>Conecta con un paciente</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('RecordatoriosResponsables')}>
          <View style={[styles.menuIconContainer, { backgroundColor: '#E1E7FF' }]}>
            <MaterialCommunityIcons name="bell-outline" size={28} color="#4D6BFE" />
          </View>
          <View>
            <Text style={styles.menuTitle}>Recordatorios</Text>
            <Text style={styles.menuSubtitle}>Supervisión de recordatorios</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('CalendarioResponsable')}>
          <View style={[styles.menuIconContainer, { backgroundColor: '#F3E8FF' }]}>
            <MaterialCommunityIcons name="calendar-month-outline" size={28} color="#A855F7" />
          </View>
          <View>
            <Text style={styles.menuTitle}>Calendario</Text>
            <Text style={styles.menuSubtitle}>Eventos de todos los pacientes</Text>
          </View>
        </TouchableOpacity>        

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('ChatBotResponsables')}>
          <View style={[styles.menuIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Image source={require('../../../assets/icons/bot-icon.png')} style={{ width: 35, height: 35 }} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.menuTitle}>Asistente</Text>
            <Text style={styles.menuSubtitle}>Consultas sobre cuidados</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
      
      <BottomTabBar />

    </View>
  );
}