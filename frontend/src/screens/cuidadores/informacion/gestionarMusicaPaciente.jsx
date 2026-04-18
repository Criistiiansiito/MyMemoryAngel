import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert, Platform, StatusBar, Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';

import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';
import { musicaService } from '../../../services/musicaService';

export default function GestionarMusicaPaciente({ route, navigation }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();
  
  const { paciente } = route.params;
  const pacienteId = paciente?.uid || paciente?.id;

  const [canciones, setCanciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [sonido, setSonido] = useState(null);
  const [estaReproduciendo, setEstaReproduciendo] = useState(false);
  const [reproduciendoId, setReproduciendoId] = useState(null);
  const [progreso, setProgreso] = useState({ posicion: 0, duracion: 0 });

  const cargarMusicaPersonal = useCallback(async () => {
    if (!pacienteId) return;
    setCargando(true);
    try {
      const data = await musicaService.obtenerMusicaPorTipo('personal', pacienteId);
      setCanciones(data);
    } catch (error) {
      console.error("Error cargando música:", error);
      Alert.alert("Error", "No se pudo conectar con la biblioteca del paciente.");
    } finally {
      setCargando(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    cargarMusicaPersonal();
    
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
    }).catch(console.error);

    const unsubscribe = navigation.addListener('blur', () => {
      if (sonido) {
        console.log("Deteniendo música por salida de pantalla...");
        sonido.stopAsync();
        sonido.unloadAsync();
      }
    });

    return () => {
      unsubscribe();
      if (sonido) {
        sonido.unloadAsync();
      }
    };
  }, [cargarMusicaPersonal, navigation, sonido]); 

  const seleccionarYSubirAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/mpeg',
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        const { uri, name, size } = result.assets[0];

        if (size > 15 * 1024 * 1024) {
          Alert.alert("Archivo muy grande", "El límite es de 15MB por canción.");
          return;
        }

        setCargando(true);
        const titulo = name.replace('.mp3', '').replace('.MP3', '');
        
        await musicaService.insertarMusicaPersonal(uri, titulo, pacienteId);
        
        Alert.alert("Completado", "Canción añadida a la lista personal.");
        cargarMusicaPersonal();
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo subir el archivo.");
      setCargando(false);
    }
  };

  const manejarReproduccion = async (pista) => {
    try {
      if (sonido && reproduciendoId === pista.id) {
        const status = await sonido.getStatusAsync();
        if (status.isPlaying) {
          await sonido.pauseAsync();
          setEstaReproduciendo(false);
        } else {
          await sonido.playAsync();
          setEstaReproduciendo(true);
        }
        return;
      }

      if (sonido) await sonido.unloadAsync();

      setReproduciendoId(pista.id);
      setEstaReproduciendo(true);

      const cleanBase64 = pista.audio.replace(/(\r\n|\n|\r)/gm, "");
      const uri = cleanBase64.startsWith('data:') ? cleanBase64 : `data:audio/mpeg;base64,${cleanBase64}`;

      const { sound: nuevoSonido } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setProgreso({ posicion: status.positionMillis, duracion: status.durationMillis });
            if (status.didJustFinish) {
              setEstaReproduciendo(false);
              setReproduciendoId(null);
            }
          }
        }
      );
      setSonido(nuevoSonido);
    } catch (e) {
      Alert.alert("Error", "Error al reproducir el archivo.");
    }
  };

  const formatearTiempo = (millis) => {
    const totalSegundos = millis / 1000;
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = Math.floor(totalSegundos % 60);
    return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={[styles.topBar, { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
            </TouchableOpacity>
            <Text style={styles.brandName}>Musica Personal</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 30, paddingTop: 10 }}>
        <Text style={{ color: '#64748B', fontSize: 14, lineHeight: 22, textAlign: 'center' }}>
            Aquí puedes añadir canciones exclusivas para {paciente?.nombre}.
        </Text>
      </View>

      {cargando ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          
          <TouchableOpacity 
            style={[styles.musicaUploadButton, { backgroundColor: '#A855F7', marginBottom: 20 }]} 
            onPress={seleccionarYSubirAudio}
          >
            <MaterialCommunityIcons name="music-note-plus" size={24} color="white" />
            <Text style={styles.musicaUploadButtonText}>Añadir canción para {paciente?.nombre?.split(' ')[0]}</Text>
          </TouchableOpacity>

          {canciones.length > 0 ? (
            canciones.map((pista) => (
                <View key={pista.id} style={styles.musicCardContainer}>
                <View style={styles.musicCardRow}>
                    
                    {/* IMAGEN */}
                    <View style={styles.musicImageContainer}>
                    {pista.imagen ? (
                        <Image 
                        source={{ uri: `data:image/jpeg;base64,${pista.imagen}` }} 
                        style={styles.musicImageThumb} 
                        />
                    ) : (
                        <View style={[styles.musicImagePlaceholder, { backgroundColor: '#A855F720' }]}>
                        <MaterialCommunityIcons name="music" size={24} color="#A855F7" />
                        </View>
                    )}
                    </View>

                    {/* TEXTO */}
                    <View style={styles.musicTextContainer}>
                    <Text 
                        style={[
                        styles.musicCardTitle, 
                        { color: reproduciendoId === pista.id ? '#A855F7' : '#334155' }
                        ]} 
                        numberOfLines={1}
                    >
                        {pista.titulo}
                    </Text>

                    <Text style={styles.musicCardDescription}>
                        {reproduciendoId === pista.id ? 'Reproduciendo...' : 'Canción disponible'}
                    </Text>
                    </View>

                    {/* BOTÓN PLAY */}
                    <TouchableOpacity 
                    style={[
                        styles.musicPlayButtonCircle, 
                        { 
                        backgroundColor: (reproduciendoId === pista.id && estaReproduciendo) 
                            ? '#A855F7' 
                            : '#F1F5F9' 
                        }
                    ]}
                    onPress={() => manejarReproduccion(pista)}
                    >
                    <MaterialCommunityIcons 
                        name={(reproduciendoId === pista.id && estaReproduciendo) ? "pause" : "play"} 
                        size={28} 
                        color={(reproduciendoId === pista.id && estaReproduciendo) ? "white" : "#A855F7"} 
                    />
                    </TouchableOpacity>

                </View>

                {/* PROGRESO */}
                {reproduciendoId === pista.id && (
                    <View style={styles.musicProgresoWrapper}>
                    <View style={styles.musicBarraFondo}>
                        <View 
                        style={[
                            styles.musicBarraRelleno, 
                            { 
                            width: `${(progreso.posicion / progreso.duracion) * 100}%`, 
                            backgroundColor: '#A855F7' 
                            }
                        ]} 
                        />
                    </View>

                    <View style={styles.musicTiempos}>
                        <Text style={styles.musicTiempoTexto}>
                        {formatearTiempo(progreso.posicion)}
                        </Text>
                        <Text style={styles.musicTiempoTexto}>
                        {formatearTiempo(progreso.duracion)}
                        </Text>
                    </View>
                    </View>
                )}
                </View>
            ))
          ) : (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <MaterialCommunityIcons name="folder-music-outline" size={70} color="#CBD5E1" />
              <Text style={{ color: '#94A3B8', marginTop: 15, textAlign: 'center' }}>
                No hay archivos personales subidos para este paciente.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}