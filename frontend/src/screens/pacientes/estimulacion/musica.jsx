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

// --- DICCIONARIOS DE RECURSOS LOCALES ---
const AUDIOS_LOCALES = {
  'clasica': require('../../../../assets/sounds/musica/clasica.mp3'),
  'barroca': require('../../../../assets/sounds/musica/barroca.mp3'),
  'yoSoyAquel': require('../../../../assets/sounds/musica/yoSoyAquel.mp3'),
  'eresTu': require('../../../../assets/sounds/musica/eresTu.mp3'),
  'libre': require('../../../../assets/sounds/musica/libre.mp3'),
  'lluvia': require('../../../../assets/sounds/musica/lluvia.mp3'),
  'paraElisa': require('../../../../assets/sounds/musica/paraElisa.mp3'),
  'organo': require('../../../../assets/sounds/musica/organo.mp3'),
  'clasicaRitmo': require('../../../../assets/sounds/musica/clasicaRitmo.mp3'),
  'barroca2': require('../../../../assets/sounds/musica/barroca2.mp3'),
  'olas': require('../../../../assets/sounds/musica/olas.mp3'),
  'gaviotas': require('../../../../assets/sounds/musica/gaviotas.mp3'),
  'bosque': require('../../../../assets/sounds/musica/bosque.mp3'),
  'grillos': require('../../../../assets/sounds/musica/grillos.mp3'),
  'pajaros': require('../../../../assets/sounds/musica/pajaros.mp3'),
  'pajaros2': require('../../../../assets/sounds/musica/pajaros2.mp3'),
  'ondasFondoBlanco': require('../../../../assets/sounds/musica/ondaFondoBlanco.mp3'),
  'ondasConSonido': require('../../../../assets/sounds/musica/ondaConSonido.mp3'),
  'ondasConLluvia': require('../../../../assets/sounds/musica/ondasConLluvia.mp3'),
};

const IMAGENES_MUSICA = {
  'clasica': require('../../../../assets/images/musica/clasica.png'),
  'barroca': require('../../../../assets/images/musica/barroca.png'),
  'yoSoyAquel': require('../../../../assets/images/musica/yoSoyAquel.jpg'),
  'eresTu': require('../../../../assets/images/musica/eresTu.jpg'),
  'libre': require('../../../../assets/images/musica/libre.jpg'),
  'lluvia': require('../../../../assets/images/musica/lluvia.jpg'),
  'paraElisa': require('../../../../assets/images/musica/paraElisa.jpg'),
  'organo': require('../../../../assets/images/musica/organo.jpg'),
  'clasicaRitmo': require('../../../../assets/images/musica/clasicaRitmo.jpg'),
  'barroca2': require('../../../../assets/images/musica/barroca2.jpg'),
  'olas': require('../../../../assets/images/musica/olas.jpg'),
  'gaviotas': require('../../../../assets/images/musica/gaviotas.jpg'),
  'bosque': require('../../../../assets/images/musica/bosque.png'),
  'grillos': require('../../../../assets/images/musica/grillos.jpg'), 
   'pajaros': require('../../../../assets/images/musica/pajaros.jpg'), 
    'pajaros2': require('../../../../assets/images/musica/pajaros2.jpg'), 
  'ondasFondoBlanco': require('../../../../assets/images/musica/ondaFondoBlanco.jpg'), 
  'ondasConLluvia': require('../../../../assets/images/musica/ondasConLLuvia.jpg'), 
'ondasConSonido': require('../../../../assets/images/musica/ondaConSonido.jpg'),
};

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
          Alert.alert("Archivo no permitido", "Solo se permiten archivos con extensión .mp3");
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

  const controlarReproduccion = async (audioData, id) => {
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

      setProgreso({ posicion: 0, duracion: 0 });
      setReproduciendoId(id);
      setEstaReproduciendo(true);

      // --- LÓGICA DE CARGA HÍBRIDA (LOCAL O BASE64) ---
      let fuenteAudio;
      if (AUDIOS_LOCALES[audioData]) {
        fuenteAudio = AUDIOS_LOCALES[audioData];
      } else {
        const cleanBase64 = audioData.replace(/(\r\n|\n|\r)/gm, "");
        const uri = cleanBase64.startsWith('data:') ? cleanBase64 : `data:audio/mpeg;base64,${cleanBase64}`;
        fuenteAudio = { uri };
      }

      const { sound: nuevoSonido } = await Audio.Sound.createAsync(
        fuenteAudio,
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
    if (vistaActual !== 'menu' || isSpeaking) {
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
                    {pista.imagen && (IMAGENES_MUSICA[pista.imagen] || pista.imagen.length > 100) ? (
                    <Image 
                      source={IMAGENES_MUSICA[pista.imagen] ? IMAGENES_MUSICA[pista.imagen] : { uri: `data:image/jpeg;base64,${pista.imagen}` }} 
                      style={styles.musicImageThumb} 
                    />
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
            <Text style={styles.emptyStateText}>Aún no hay canciones disponibles.</Text>
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