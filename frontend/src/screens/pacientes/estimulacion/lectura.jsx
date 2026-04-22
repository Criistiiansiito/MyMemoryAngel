import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, StyleSheet, 
  ActivityIndicator, Alert, Image, Dimensions, Platform, StatusBar 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';
import { lecturaService } from '../../../services/lecturaService';
import MenuCategoriaEstimulacion from '../../../components/estimulacion/MenuCardEstimulacion';

const { width } = Dimensions.get('window');

export default function Lectura({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [vistaActual, setVistaActual] = useState('menu'); 
  const [textos, setTextos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [textoSeleccionado, setTextoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);

  const [fontSize, setFontSize] = useState(22);
  const [progresoLectura, setProgresoLectura] = useState(0);
  const [isTalking, setIsTalking] = useState(false);
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);

  // Limpiamos la voz al terminar
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (vistaActual !== 'menu') {
      Speech.stop();
      setIsSpeakingSummary(false);
    }
  }, [vistaActual]);

  const onSelectCategoria = async (item) => {
    setCargando(true);
    setCategoriaActiva(item);
    try {
      const data = await lecturaService.obtenerLecturasPorTipo(item.tipo);
      if (data && data.length > 0) {
        setTextos(data);
        setVistaActual('lista');
      } else {
        Alert.alert("Aviso", "No hay lecturas disponibles.");
      }
    } catch (error) {
      Alert.alert("Error", "Error de conexión.");
    } finally {
      setCargando(false);
    }
  };

  const controlarVoz = () => {
    if (isTalking) {
      Speech.stop();
      setIsTalking(false);
    } else {
      setIsTalking(true);
      Speech.speak(textoSeleccionado?.contenido, {
        language: 'es',
        pitch: 1.0,
        rate: 0.5,
        onDone: () => setIsTalking(false),
        onStopped: () => setIsTalking(false),
        onError: () => {
          setIsTalking(false);
          Alert.alert("Error", "No se pudo reproducir el audio.");
        }
      });
    }
  };

  const leerResumen = () => {
    if (vistaActual !== 'menu') {
      Speech.stop();
      setIsSpeakingSummary(false);
      return;
    }

    if (isSpeakingSummary) {
      Speech.stop();
      setIsSpeakingSummary(false);
      return;
    }

    const mensaje = [
      'Estas en la seccion de lectura.',
      'Relatos del ayer ofrece historias de otras epocas para recordar y conversar.',
      'Lectura facilitada usa textos cortos y sencillos para leer con comodidad.',
      'Poesia y rimas ayuda a trabajar memoria y ritmo con textos breves.',
      'Naturaleza incluye curiosidades y articulos suaves para una lectura tranquila.',
      'Pulsa una categoria para ver sus lecturas.',
    ].join(' ');

    setIsSpeakingSummary(true);
    Speech.speak(mensaje, {
      language: 'es-ES',
      pitch: 1,
      rate: 0.8,
      onDone: () => setIsSpeakingSummary(false),
      onStopped: () => setIsSpeakingSummary(false),
      onError: () => setIsSpeakingSummary(false),
    });
  };

  const categoriasLectura = [
    { id: 1, titulo: 'Relatos del Ayer', tipo: 'reminiscencia', meta: '5-10 min', descripcion: 'Historias de los años 50, 60 y 70 para recordar.', icono: 'history', color: '#6366F1', actionIcon: 'book-open-variant', actionLabel: 'Leer' },
    { id: 2, titulo: 'Lectura Facilitada', tipo: 'adaptada', meta: '2-5 min', descripcion: 'Textos cortos con frases sencillas y claras.', icono: 'format-size', color: '#EC4899', actionIcon: 'book-open-variant', actionLabel: 'Leer' },
    { id: 3, titulo: 'Poesía y Rimas', tipo: 'poesia', meta: '3 min', descripcion: 'Lecturas con ritmo para estimular la memoria.', icono: 'feather', color: '#F59E0B', actionIcon: 'book-open-variant', actionLabel: 'Leer' },
    { id: 4, titulo: 'Naturaleza', tipo: 'curiosidades', meta: '5 min', descripcion: 'Artículos breves sobre el mundo natural.', icono: 'leaf', color: '#10B981', actionIcon: 'book-open-variant', actionLabel: 'Leer' },
  ];

  const renderMenu = () => (
    <MenuCategoriaEstimulacion items={categoriasLectura} onSelectItem={onSelectCategoria} />
  );

  const renderLista = () => (
    <ScrollView 
      contentContainerStyle={{ padding: 15, paddingBottom: insets.bottom + 50 }}
      showsVerticalScrollIndicator={false}
    >
      {textos.map(t => (
        <TouchableOpacity 
          key={t.id} 
          style={styles.tarjetaLectura} 
          onPress={() => { setTextoSeleccionado(t); setVistaActual('lector'); }}
          activeOpacity={0.9}
        >
          <View style={styles.contenedorImagenCorteLectura}>
            {t.imagenPrincipal ? (
              <Image 
                source={{ uri: `data:image/jpeg;base64,${t.imagenPrincipal}` }} 
                style={styles.imagenLectura}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.imagenLectura, { backgroundColor: categoriaActiva?.color + '20', justifyContent: 'center', alignItems: 'center' }]}>
                <MaterialCommunityIcons name="book-open-page-variant" size={100} color={categoriaActiva?.color} />
              </View>
            )}
            <View style={styles.corteOblicuoLectura} />
          </View>

          <View style={styles.infoCapaLectura}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tituloListaLectura} numberOfLines={2}>{t.titulo}</Text>
              <View style={styles.badgeListaLectura}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#64748B" />
                <Text style={styles.tiempoListaLectura}>{categoriaActiva?.meta}</Text>
              </View>
            </View>
            <View style={[styles.circuloLectura, { backgroundColor: categoriaActiva?.color }]}>
              <MaterialCommunityIcons name="chevron-right" size={30} color="white" />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderLector = () => (
    <View style={{ flex: 1, backgroundColor: '#FDFCF0' }}>
      <ScrollView 
        onScroll={(e) => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
          setProgresoLectura(Math.min(((layoutMeasurement.height + contentOffset.y) / contentSize.height) * 100, 100));
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.portadaLecturaContainer}>
          {textoSeleccionado?.imagenPrincipal ? (
            <Image 
              source={{ uri: `data:image/jpeg;base64,${textoSeleccionado.imagenPrincipal}` }} 
              style={styles.imagenLecturaPortada}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagenLecturaPlaceholder, { backgroundColor: categoriaActiva?.color + '20' }]}>
              <MaterialCommunityIcons name="book-open-page-variant" size={80} color={categoriaActiva?.color} />
            </View>
          )}
          
          <View style={styles.overlayLecturaTitulo}>
              <Text style={styles.tituloTextoLectura}>{textoSeleccionado?.titulo}</Text>
              <View style={[styles.divisorLectura, { backgroundColor: categoriaActiva?.color }]} />
          </View>
        </View>

        <View style={{ padding: 25, paddingBottom: insets.bottom + 160 }}>
          <Text style={{ 
            fontSize: fontSize, 
            lineHeight: fontSize * 1.6, 
            color: '#334155', 
            textAlign: 'justify' 
          }}>
            {textoSeleccionado?.contenido}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.controlesInferioresLectura, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.containerProgresoLectura}>
          <View style={[styles.barraProgresoLectura, { width: `${progresoLectura}%`, backgroundColor: categoriaActiva?.color }]} />
        </View>
        <View style={styles.botonesRowLectura}>
          <View style={styles.grupoBotonesLectura}>
            <TouchableOpacity onPress={() => setFontSize(f => Math.max(18, f-2))} style={styles.botonControlLectura}>
              <MaterialCommunityIcons name="format-font-size-decrease" size={24} color="#475569" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFontSize(f => Math.min(40, f+2))} style={styles.botonControlLectura}>
              <MaterialCommunityIcons name="format-font-size-increase" size={24} color="#475569" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            onPress={controlarVoz}
            style={[styles.botonVozLectura, { backgroundColor: isTalking ? '#EF4444' : categoriaActiva?.color }]}
          >
            <MaterialCommunityIcons name={isTalking ? "stop" : "volume-high"} size={26} color="white" />
            <Text style={styles.textVozLectura}>{isTalking ? "Parar" : "Escuchar"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { flex: 1 }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[
        styles.topBar, 
        { paddingTop: insets.top }
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => {
                if (isTalking || isSpeakingSummary) Speech.stop();
                if (vistaActual === 'menu') {
                  onBack();
                } else {
                  setVistaActual(vistaActual === 'lector' ? 'lista' : 'menu');
                }
              }}
            >
              <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
            </TouchableOpacity>
            <Text style={styles.brandName}>
              {vistaActual === 'menu' ? 'Lectura' : (vistaActual === 'lista' ? categoriaActiva?.titulo : 'Leyendo')}
            </Text>
          </View>
          {vistaActual === 'menu' ? (
            <TouchableOpacity style={styles.headerIconButton} onPress={leerResumen}>
              <MaterialCommunityIcons name={isSpeakingSummary ? 'stop' : 'volume-high'} size={24} color="#334155" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {cargando ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <>
          {vistaActual === 'menu' && renderMenu()}
          {vistaActual === 'lista' && renderLista()}
          {vistaActual === 'lector' && renderLector()}
        </>
      )}
    </View>
  );
}
