import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, PanResponder, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 40;

export default function ArteActividad({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);

  // ESTADOS
  const [paths, setPaths] = useState([]);             // Lista de trazos terminados
  const [currentPath, setCurrentPath] = useState(''); // Trazo que se está dibujando ahora mismo
  const [selectedColor, setSelectedColor] = useState('#EF4444');
  const [isEraser, setIsEraser] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        // Iniciar el trazo actual
        setCurrentPath(`M${locationX.toFixed(1)},${locationY.toFixed(1)}`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        // Continuar el trazo actual
        setCurrentPath((prevPath) => `${prevPath} L${locationX.toFixed(1)},${locationY.toFixed(1)}`);
      },
      onPanResponderRelease: () => {
        // CUANDO SE LEVANTA EL DEDO: Guardamos el trazo CON SU COLOR ACTUAL
        if (currentPath) {
          const nuevoTrazo = {
            d: currentPath,
            color: isEraser ? '#FFFFFF' : selectedColor,
            width: isEraser ? 25 : 6 // Goma más ancha para facilitar el borrado
          };
          
          setPaths((prev) => [...prev, nuevoTrazo]); // Se añade a la lista permanente
          setCurrentPath(''); // Se limpia el lienzo temporal
        }
      },
    })
  ).current;

  const colors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#000000'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#334155" />
          </TouchableOpacity>
          <Text style={[styles.brandName, { marginLeft: 10 }]}>Taller de Arte</Text>
        </View>
        <TouchableOpacity onPress={() => setPaths([])}>
          <MaterialCommunityIcons name="delete-sweep-outline" size={28} color="#F43F5E" />
        </TouchableOpacity>
      </View>

      {/* Área de Dibujo */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View 
          style={{ 
            width: CANVAS_SIZE, 
            height: CANVAS_SIZE, 
            backgroundColor: 'white', 
            borderRadius: 20, 
            elevation: 5,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#E2E8F0'
          }}
          {...panResponder.panHandlers}
        >
          <Svg height="100%" width="100%">
            {/* 1. Dibujar todos los trazos guardados (cada uno con su propio color) */}
            {paths.map((item, index) => (
              <Path 
                key={`path-${index}`} 
                d={item.d} 
                stroke={item.color} 
                strokeWidth={item.width} 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            ))}
            
            {/* 2. Dibujar el trazo que se está haciendo AHORA (feedback visual) */}
            {currentPath ? (
              <Path 
                d={currentPath} 
                stroke={isEraser ? '#FFFFFF' : selectedColor} 
                strokeWidth={isEraser ? 25 : 6} 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            ) : null}
          </Svg>
        </View>
      </View>

      {/* Herramientas */}
      <View style={[styles.settingsCard, { margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
          
          {/* Toggle Pincel/Goma */}
          <TouchableOpacity 
            onPress={() => setIsEraser(!isEraser)}
            style={{ 
              width: 50, height: 50, borderRadius: 15, 
              backgroundColor: isEraser ? '#6366F1' : '#F1F5F9',
              justifyContent: 'center', alignItems: 'center', marginRight: 15
            }}
          >
            <MaterialCommunityIcons name={isEraser ? "eraser" : "brush"} size={28} color={isEraser ? "white" : "#64748B"} />
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {colors.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => {
                  setSelectedColor(c);
                  setIsEraser(false);
                }}
                style={{
                  width: 44, height: 44, borderRadius: 22, backgroundColor: c, marginRight: 10,
                  borderWidth: (selectedColor === c && !isEraser) ? 4 : 1,
                  borderColor: '#334155'
                }}
              />
            ))}
          </ScrollView>
        </View>
        <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center' }}>
          {isEraser ? "Borrando... (Usa el dedo sobre los trazos)" : "Pintando... Selecciona un color"}
        </Text>
      </View>
    </SafeAreaView>
  );
}