import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert, Image, Platform, StatusBar, StyleSheet 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { File } from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';
import { musicaService } from '../../../services/musicaService';
import { useStoredUser } from '../../../hooks/storedUser';
import MenuCategoriaEstimulacion from '../../../components/estimulacion/MenuCardEstimulacion';

export default function Musica({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [vistaActual, setVistaActual] = useState('menu');
  const [canciones, setCanciones] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [sonido, setSonido] = useState(null);
  const [estaReproduciendo, setEstaReproduciendo] = useState(false);
  const [reproduciendoId, setReproduciendoId] = useState(null);
  const [progreso, setProgreso] = useState({ posicion: 0, duracion: 0 });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const user = useStoredUser();
  const userId = user?.uid;

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
    return () => {
      Speech.stop();
      if (sonido) sonido.unloadAsync();
    };
  }, [sonido]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        Speech.stop();
        setIsSpeaking(false);
      };
    }, [])
  );

  useEffect(() => {
    if (vistaActual !== 'menu') {
      Speech.stop();
      setIsSpeaking(false);
    }
  }, [vistaActual]);

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
      if (sonido && reproduciendoId === id) {
        const status = await sonido.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await sonido.pauseAsync();
            setEstaReproduciendo(false);
          } else {
            await sonido.playAsync();
            setEstaReproduciendo(true); 
          }
          return;
        }
      }

      if (sonido) {
        await sonido.stopAsync();
        await sonido.unloadAsync();
        setSonido(null);
      }

      setProgreso({ posicion: 0, duracion: 0 }); // Reiniciamos progreso solo aquí
      setReproduciendoId(id);
      setEstaReproduciendo(true);

      const cleanBase64 = base64Data.replace(/(\r\n|\n|\r)/gm, "");
      const uri = cleanBase64.startsWith('data:') ? cleanBase64 : `data:audio/mpeg;base64,${cleanBase64}`;

      const { sound: nuevoSonido } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0 },
        actualizarEstadoProgreso
      );

      setSonido(nuevoSonido);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo reproducir");
    }
  };

  const actualizarEstadoProgreso = (status) => {
    if (status.isLoaded) {
      setProgreso({ posicion: status.positionMillis, duracion: status.durationMillis });
      
      if (status.didJustFinish) {
        setEstaReproduciendo(false);
        setReproduciendoId(null);
        setProgreso({ posicion: 0, duracion: 0 });
      }
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
    Speech.stop();
    setIsSpeaking(false);
    if (sonido) { await sonido.stopAsync(); await sonido.unloadAsync(); setSonido(null); }
    setVistaActual('menu');
    setReproduciendoId(null);
  };

  const categoriasMusica = [
    { id: 1, titulo: 'Mis Recuerdos', tipo: 'personal', meta: 'Cualquier momento', descripcion: 'Sube tus canciones favoritas para escucharlas aquí.', icono: 'account-music', color: '#6366F1', actionIcon: 'play-circle', actionLabel: 'Escuchar' },
    { id: 2, titulo: 'Naturaleza', tipo: 'naturaleza', meta: 'Tarde o Relax', descripcion: 'Sonidos de lluvia u olas para un entorno tranquilo.', icono: 'sprout', color: '#10B981', actionIcon: 'play-circle', actionLabel: 'Escuchar' },
    { id: 3, titulo: 'Clásica', tipo: 'clasica', meta: 'Mañana', descripcion: 'Ritmos constantes para reducir la ansiedad.', icono: 'music-clef-treble', color: '#F59E0B', actionIcon: 'play-circle', actionLabel: 'Escuchar' },
    { id: 4, titulo: 'Terapia 40 Hz', tipo: 'frecuencias', meta: 'Sesión Diaria', descripcion: 'Frecuencias para la estimulación neuroprotectora.', icono: 'waveform', color: '#EC4899', actionIcon: 'play-circle', actionLabel: 'Escuchar' },
  ];

  const leerResumen = () => {
    if (vistaActual !== 'menu') {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const mensaje = [
      'Estás en la sección de musicoterapia.',
      'Mis recuerdos sirve para guardar y escuchar tus canciones personales, especialmente en momentos de nostalgia o para recordar.',
      'Naturaleza es ideal para relajarse, por ejemplo antes de dormir o cuando te sientas nervioso.',
      'Clásica está pensada para momentos de calma o cuando quieras concentrarte.',
      'La terapia de cuarenta hercios se usa en sesiones de estimulación auditiva diaria, preferiblemente en un momento tranquilo del día.',
      'Pulsa una categoría para entrar y escuchar sus canciones.',
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

  const renderMenu = () => (
    <MenuCategoriaEstimulacion items={categoriasMusica} onSelectItem={onSelectCategoria} />
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
                    { backgroundColor: (reproduciendoId === pista.id && estaReproduciendo) ? categoriaActiva.color : '#F1F5F9' }
                  ]}
                  onPress={() => controlarReproduccion(pista.audio, pista.id)}
                >
                  <MaterialCommunityIcons 
                    // La clave es esta condición:
                    name={(reproduciendoId === pista.id && estaReproduciendo) ? "pause" : "play"} 
                    size={28} 
                    color={(reproduciendoId === pista.id && estaReproduciendo) ? "white" : categoriaActiva.color} 
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
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={vistaActual === 'menu' ? onBack : volverAlMenu}>
              <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
            </TouchableOpacity>
            <Text style={styles.brandName}>
              {vistaActual === 'menu' ? 'Musicoterapia' : categoriaActiva?.titulo}
            </Text>
          </View>
          {vistaActual === 'menu' && (
            <TouchableOpacity style={styles.headerIconButton} onPress={leerResumen}>
              <MaterialCommunityIcons name={isSpeaking ? 'stop' : 'volume-high'} size={24} color="#334155" />
            </TouchableOpacity>
          )}
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
