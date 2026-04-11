import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import { configuracionPerfil } from '../../services/configuracionPerfil'; // Usamos tu servicio
import BottomTabBar from '../../components/BottomTabBar';

export default function DashboardPaciente({ navigation }) {
  const [nombreUsuario, setNombreUsuario] = useState('Paciente'); 
  const [fotoPerfil, setFotoPerfil] = useState(null); 
  const [loading, setLoading] = useState(true);
  
  // Fecha dinámica (opcional, para que no sea siempre martes 3 de marzo)
  const fechaHoy = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  const { aplicarEscala, cargarDesdeServidor, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);

  useEffect(() => {
    // Usamos focus para que si cambias algo en Configuración, 
    // al volver al Dashboard se refresquen los datos.
    const unsubscribe = navigation.addListener('focus', () => {
      obtenerPerfil();
    });
    return unsubscribe;
  }, [navigation]);

  const obtenerPerfil = async () => {
    try {
      // Usamos el método centralizado de tu servicio
      const res = await configuracionPerfil.obtenerPerfil();

      if (res.ok) {
        const usuario = res.data?.usuario || res.usuario;
        
        setNombreUsuario(usuario.nombre || 'Paciente');
        if (usuario.foto_perfil) {
          setFotoPerfil(usuario.foto_perfil);
        }

        // SINCRONIZAR ACCESIBILIDAD
        // Le pasamos el objeto usuario completo, 
        // tu función cargarDesdeServidor ya sabe qué campos usar.
        cargarDesdeServidor(usuario);
      }
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      // Si el error es por token inválido, redirigir
      if (error.response?.status === 401) {
        navigation.replace('InicioSesion');
      }
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

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          
          <View style={styles.headerUserInfo}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F0FE', marginRight: 10, overflow: 'hidden' }]}>
              {fotoPerfil ? (
                <Image 
                  source={{ uri: fotoPerfil }} 
                  style={{ width: '100%', height: '100%' }} 
                  resizeMode="cover"
                />
              ) : (
                <MaterialCommunityIcons name="account" size={30} color="#334155" />
              )}
            </View>
            <Text style={styles.brandName}>Hola, {nombreUsuario}</Text> 
          </View>

          <View style={{ flexDirection: 'row' }}> 
            <TouchableOpacity style={styles.headerIconButton}>
              <MaterialCommunityIcons name="volume-high" size={24} color="#334155" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerIconButton} 
              onPress={() => navigation.navigate('Configuracion')}
            >
              <MaterialCommunityIcons name="cog-outline" size={24} color="#334155" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.dateText}>{fechaHoy}</Text>
      </View>

      {/* CUERPO */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}>
        
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

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('Juegos')}>
          <View style={[styles.menuIconContainer, { backgroundColor: '#DCFCE7' }]}>
            <MaterialCommunityIcons name="brain" size={28} color="#22C55E" />
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
      
      <BottomTabBar />

    </SafeAreaView>
  );
}