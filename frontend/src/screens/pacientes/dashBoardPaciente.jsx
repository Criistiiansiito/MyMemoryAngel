import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import BottomTabBar from '../../components/BottomTabBar';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : 'http://172.20.10.5:5000/api';

export default function DashboardPaciente({ navigation }) {
  const [nombreUsuario, setNombreUsuario] = useState('Paciente'); 
  const [fotoPerfil, setFotoPerfil] = useState(null); 
  const [loading, setLoading] = useState(true);
  const fechaHoy = "martes, 3 de marzo de 2026";

  const { aplicarEscala } = useAccesibilidad();
  const styles = getStyles(aplicarEscala);

    useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      obtenerPerfil();
    });

    return unsubscribe;
  }, [navigation]);

  const obtenerPerfil = async () => {
    try {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
      } else {
        token = await SecureStore.getItemAsync('userToken');
      }

      if (!token) {
        navigation.replace('InicioSesion');
        return;
      }

      const res = await axios.get(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.ok) {
        setNombreUsuario(res.data.usuario.nombre);
        if (res.data.usuario.foto_perfil) {
          setFotoPerfil(res.data.usuario.foto_perfil);
        }
      }
    } catch (error) {
      console.error("Error al obtener perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#4D6BFE" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          
          {/* Avatar + Nombre */}
          <View style={styles.headerUserInfo}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F0FE', marginRight: 10, overflow: 'hidden' }]}>
              {fotoPerfil ? (
                // Si hay foto, la mostramos
                <Image 
                  source={{ uri: fotoPerfil }} 
                  style={{ width: '100%', height: '100%' }} 
                  resizeMode="cover"
                />
              ) : (
                // Si no, el icono de siempre
                <MaterialCommunityIcons name="account" size={30} color="#334155" />
              )}
            </View>
            <Text style={styles.brandName}>Hola, {nombreUsuario}</Text> 
          </View>

          {/* Botones de acción */}
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
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, marginTop: 30 }}>
        
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