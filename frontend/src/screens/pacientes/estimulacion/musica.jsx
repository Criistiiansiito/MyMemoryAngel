import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';
import { musicaService } from '../../../services/musicaService';

export default function Musica({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);

  const [vistaActual, setVistaActual] = useState('menu');
  const [canciones, setCanciones] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [sonido, setSonido] = useState(null);
  const [reproduciendoId, setReproduciendoId] = useState(null);
  const [progreso, setProgreso] = useState({ posicion: 0, duracion: 0 });

  const categoriasMusica = [
    { id: 1, titulo: 'Banda Sonora de Vida', tipo: 'personal', momento: 'Cualquier momento', descripcion: 'Canciones de tu juventud para evocar recuerdos.', icono: 'account-music', color: '#6366F1' },
    { id: 2, titulo: 'Naturaleza', tipo: 'naturaleza', momento: 'Tarde o Relax', descripcion: 'Sonidos de lluvia u olas para un entorno tranquilo.', icono: 'sprout', color: '#10B981' },
    { id: 3, titulo: 'Clásica', tipo: 'clasica', momento: 'Mañana', descripcion: 'Ritmos constantes para reducir la ansiedad.', icono: 'music-clef-treble', color: '#F59E0B' },
    { id: 4, titulo: 'Terapia 40 Hz', tipo: 'frecuencias', momento: 'Sesión Diaria', descripcion: 'Frecuencias para la estimulación neuroprotectora.', icono: 'waveform', color: '#EC4899' },
  ];

  useEffect(() => {
    return () => { if (sonido) sonido.unloadAsync(); };
  }, [sonido]);

  const onSelectCategoria = async (item) => {
    setCargando(true);
    setCategoriaActiva(item);
    try {
      const data = await musicaService.obtenerMusicaPorTipo(item.tipo);
      setCanciones(data);
      setVistaActual('reproductor');
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con la base de datos");
    } finally {
      setCargando(false);
    }
  };

  const controlarReproduccion = async (base64Data, id) => {
    try {
      if (reproduciendoId === id) {
        await sonido.pauseAsync();
        setReproduciendoId(null);
        return;
      }
      if (sonido) await sonido.unloadAsync();

      const { sound: nuevoSonido } = await Audio.Sound.createAsync(
        { uri: `data:audio/mpeg;base64,${base64Data}` },
        { shouldPlay: true }
      );

      setSonido(nuevoSonido);
      setReproduciendoId(id);

      nuevoSonido.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setProgreso({
            posicion: status.positionMillis,
            duracion: status.durationMillis,
          });
          if (status.didJustFinish) setReproduciendoId(null);
        }
      });
    } catch (e) {
      Alert.alert("Error", "No se pudo reproducir el audio");
    }
  };

  const formatearTiempo = (millis) => {
    const minutos = Math.floor(millis / 60000);
    const segundos = ((millis % 60000) / 1000).toFixed(0);
    return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  };

  const calcularBarra = () => {
    if (progreso.duracion > 0) return (progreso.posicion / progreso.duracion) * 100;
    return 0;
  };

  const volverAlMenu = async () => {
    if (sonido) await sonido.stopAsync();
    setVistaActual('menu');
    setReproduciendoId(null);
    setProgreso({ posicion: 0, duracion: 0 });
  };

  const renderMenu = () => (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {categoriasMusica.map((item) => (
        <TouchableOpacity key={item.id} style={styles.musicCard} onPress={() => onSelectCategoria(item)}>
          <View style={[styles.musicIconContainer, { backgroundColor: item.color }]}>
            <MaterialCommunityIcons name={item.icono} size={32} color="white" />
          </View>
          <View style={styles.musicTextContainer}>
            <Text style={styles.musicCardTitle}>{item.titulo}</Text>
            
            <Text style={styles.musicCardDescription} numberOfLines={2}>
              {item.descripcion}
            </Text>
            
            {/* Badge Unificado: Escuchar | Momento */}
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
    <ScrollView style={styles.container} contentContainerStyle={styles.musicScrollContainer}>
      {canciones.length > 0 ? (
        canciones.map((pista) => (
          <View key={pista.id} style={styles.musicCardContainer}>
            <View style={styles.musicCardRow}>
              <View style={styles.musicImageContainer}>
                {pista.imagen ? (
                  <Image 
                    source={{ uri: `data:image/jpeg;base64,${pista.imagen}` }} 
                    style={styles.musicImageThumb} 
                  />
                ) : (
                  <View style={[styles.musicImagePlaceholder, { backgroundColor: categoriaActiva.color + '20' }]}>
                    <MaterialCommunityIcons name="music" size={24} color={categoriaActiva.color} />
                  </View>
                )}
              </View>

              <View style={styles.musicTextContainer}>
                <Text 
                  style={[styles.musicCardTitle, { color: reproduciendoId === pista.id ? categoriaActiva.color : '#334155' }]} 
                  numberOfLines={1}
                >
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
          <Text style={styles.emptyStateText}>No hay canciones disponibles.</Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
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
        <ActivityIndicator size="large" color="#6366F1" style={{ flex: 1 }} />
      ) : (
        vistaActual === 'menu' ? renderMenu() : renderReproductor()
      )}
    </View>
  );
}