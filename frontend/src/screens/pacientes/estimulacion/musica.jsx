import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert, Image, Platform, StatusBar, StyleSheet 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { File } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';
import { musicaService } from '../../../services/musicaService';

export default function Musica({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [vistaActual, setVistaActual] = useState('menu');
  const [canciones, setCanciones] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [sonido, setSonido] = useState(null);
  const [reproduciendoId, setReproduciendoId] = useState(null);
  const [progreso, setProgreso] = useState({ posicion: 0, duracion: 0 });
  const [userId, setUserId] = useState(null);

  // Obtener el ID del usuario al iniciar
  useEffect(() => {
    const getUserId = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const { uid } = JSON.parse(userData);
        setUserId(uid);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    const configurarAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) { console.error(e); }
    };
    configurarAudio();
    return () => { if (sonido) sonido.unloadAsync(); };
  }, [sonido]);

  const onSelectCategoria = async (item) => {
    setCargando(true);
    setCategoriaActiva(item);
    try {
      // Si es personal, enviamos el userId para filtrar sus canciones
      const data = await musicaService.obtenerMusicaPorTipo(item.tipo, item.tipo === 'personal' ? userId : null);
      setCanciones(data);
      setVistaActual('reproductor');
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la música");
    } finally {
      setCargando(false);
    }
  };

const seleccionarYSubirAudio = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/mpeg', 
      copyToCacheDirectory: true
    });

    if (!result.canceled) {
      const { uri, name, size } = result.assets[0];

      const extension = name.split('.').pop().toLowerCase();
      if (extension !== 'mp3') {
        Alert.alert(
          "Archivo no permitido", 
          "Solo se permiten archivos con extensión .mp3"
        );
        return;
      }
      
      if (size > 10 * 1024 * 1024) {
        Alert.alert("Error", "El archivo MP3 es demasiado grande (máx 10MB).");
        return;
      }

      setCargando(true);
      const titulo = name.split('.')[0];

      await musicaService.insertarMusicaPersonal(uri, titulo, userId);

      Alert.alert("¡Éxito!", "MP3 guardado en tus recuerdos.");
      const data = await musicaService.obtenerMusicaPorTipo('personal', userId);
      setCanciones(data);
    }
  } catch (error) {
    Alert.alert("Error", "No se pudo procesar el archivo.");
  } finally {
    setCargando(false);
  }
};

  const controlarReproduccion = async (base64Data, id) => {
    try {
      if (reproduciendoId === id && sonido) {
        const status = await sonido.getStatusAsync();
        if (status.isLoaded) {
          status.isPlaying ? await sonido.pauseAsync() : await sonido.playAsync();
          return;
        }
      }
      if (sonido) {
        await sonido.stopAsync();
        await sonido.unloadAsync();
      }
      const uri = base64Data.startsWith('data:') ? base64Data : `data:audio/mpeg;base64,${base64Data}`;
      const { sound: nuevoSonido } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0 },
        actualizarEstadoProgreso
      );
      setSonido(nuevoSonido);
      setReproduciendoId(id);
    } catch (e) { Alert.alert("Error", "No se pudo reproducir"); }
  };

  const actualizarEstadoProgreso = (status) => {
    if (status.isLoaded) {
      setProgreso({ posicion: status.positionMillis, duracion: status.durationMillis });
      if (status.didJustFinish) setReproduciendoId(null);
    }
  };

  const formatearTiempo = (millis) => {
    if (!millis || isNaN(millis)) return "0:00";
    const minutos = Math.floor(millis / 60000);
    const segundos = Math.floor((millis % 60000) / 1000);
    return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  };

  const calcularBarra = () => progreso.duracion > 0 ? (progreso.posicion / progreso.duracion) * 100 : 0;

  const volverAlMenu = async () => {
    if (sonido) { await sonido.stopAsync(); await sonido.unloadAsync(); setSonido(null); }
    setVistaActual('menu');
    setReproduciendoId(null);
  };

  const categoriasMusica = [
    { id: 1, titulo: 'Mis Recuerdos', tipo: 'personal', momento: 'Cualquier momento', descripcion: 'Sube tus canciones favoritas para escucharlas aquí.', icono: 'account-music', color: '#6366F1' },
    { id: 2, titulo: 'Naturaleza', tipo: 'naturaleza', momento: 'Tarde o Relax', descripcion: 'Sonidos de lluvia u olas para un entorno tranquilo.', icono: 'sprout', color: '#10B981' },
    { id: 3, titulo: 'Clásica', tipo: 'clasica', momento: 'Mañana', descripcion: 'Ritmos constantes para reducir la ansiedad.', icono: 'music-clef-treble', color: '#F59E0B' },
    { id: 4, titulo: 'Terapia 40 Hz', tipo: 'frecuencias', momento: 'Sesión Diaria', descripcion: 'Frecuencias para la estimulación neuroprotectora.', icono: 'waveform', color: '#EC4899' },
  ];

  const renderMenu = () => (
    <ScrollView 
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {categoriasMusica.map((item) => (
        <TouchableOpacity key={item.id} style={styles.musicCard} onPress={() => onSelectCategoria(item)}>
          <View style={[styles.musicIconContainer, { backgroundColor: item.color }]}>
            <MaterialCommunityIcons name={item.icono} size={32} color="white" />
          </View>
          <View style={styles.musicTextContainer}>
            <Text style={styles.musicCardTitle}>{item.titulo}</Text>
            <Text style={styles.musicCardDescription} numberOfLines={2}>{item.descripcion}</Text>
            <View style={styles.musicBadge}>
              <View style={styles.musicBadgePlaySection}>
                <MaterialCommunityIcons name="play-circle" size={16} color={item.color} />
                <Text style={[styles.musicBadgeText, { color: item.color }]}>Escuchar</Text>
              </View>
              <Text style={styles.musicSeparator}>|</Text>
              <View style={styles.musicBadgeMomentSection}>
                <MaterialCommunityIcons name="clock-outline" size={13} color="#64748B" />
                <Text style={styles.momentoTextInline}>{item.momento}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderReproductor = () => (
    <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.musicScrollContainer} showsVerticalScrollIndicator={false}>
        {/* BOTÓN DE AÑADIR */}
        {categoriaActiva?.tipo === 'personal' && (
            <TouchableOpacity 
                style={styles.musicaUploadButton}
                onPress={seleccionarYSubirAudio}
            >
                <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
                <Text style={styles.musicaUploadButtonText}>Añadir nueva canción</Text>
            </TouchableOpacity>
        )}

        {canciones.length > 0 ? (
            canciones.map((pista) => (
            <View key={pista.id} style={styles.musicCardContainer}>
                <View style={styles.musicCardRow}>
                <View style={styles.musicImageContainer}>
                    {pista.imagen ? (
                    <Image source={{ uri: `data:image/jpeg;base64,${pista.imagen}` }} style={styles.musicImageThumb} />
                    ) : (
                    <View style={[styles.musicImagePlaceholder, { backgroundColor: categoriaActiva.color + '20' }]}>
                        <MaterialCommunityIcons name="music" size={24} color={categoriaActiva.color} />
                    </View>
                    )}
                </View>

                <View style={styles.musicTextContainer}>
                    <Text style={[styles.musicCardTitle, { color: reproduciendoId === pista.id ? categoriaActiva.color : '#334155' }]} numberOfLines={1}>
                    {pista.titulo}
                    </Text>
                    <Text style={styles.musicCardDescription}>
                    {reproduciendoId === pista.id ? 'Reproduciendo...' : 'Canción disponible'}
                    </Text>
                </View>

                <TouchableOpacity 
                    style={[
                    styles.musicPlayButtonCircle, 
                    { backgroundColor: reproduciendoId === pista.id ? categoriaActiva.color : '#F1F5F9' }
                    ]}
                    onPress={() => controlarReproduccion(pista.audio, pista.id)}
                >
                    <MaterialCommunityIcons 
                    name={reproduciendoId === pista.id ? "pause" : "play"} 
                    size={28} 
                    color={reproduciendoId === pista.id ? "white" : categoriaActiva.color} 
                    />
                </TouchableOpacity>
                </View>

                {reproduciendoId === pista.id && (
                <View style={styles.musicProgresoWrapper}>
                    <View style={styles.musicBarraFondo}>
                    <View style={[styles.musicBarraRelleno, { width: `${calcularBarra()}%`, backgroundColor: categoriaActiva.color }]} />
                    </View>
                    <View style={styles.musicTiempos}>
                    <Text style={styles.musicTiempoTexto}>{formatearTiempo(progreso.posicion)}</Text>
                    <Text style={styles.musicTiempoTexto}>{formatearTiempo(progreso.duracion)}</Text>
                    </View>
                </View>
                )}
            </View>
            ))
        ) : (
            <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="music-off" size={80} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>Aún no has subido canciones.</Text>
            </View>
        )}
        </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={vistaActual === 'menu' ? onBack : volverAlMenu}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>
            {vistaActual === 'menu' ? 'Musicoterapia' : categoriaActiva?.titulo}
          </Text>
        </View>
      </View>
      
      {cargando ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        vistaActual === 'menu' ? renderMenu() : renderReproductor()
      )}
    </View>
  );
}
