import React, { useState, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, PanResponder, 
  Dimensions, StyleSheet, Platform, StatusBar 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

export default function ArteActividad({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [paths, setPaths] = useState([]);             
  const [currentPath, setCurrentPath] = useState(''); 
  const [selectedColor, setSelectedColor] = useState('#EF4444');
  const [isEraser, setIsEraser] = useState(false);

  const colorRef = useRef('#EF4444');
  const eraserRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M${locationX.toFixed(1)},${locationY.toFixed(1)}`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => `${prev} L${locationX.toFixed(1)},${locationY.toFixed(1)}`);
      },
      onPanResponderRelease: () => {
        setCurrentPath((finalPath) => {
          if (finalPath) {
            const nuevoTrazo = {
              d: finalPath,
              color: eraserRef.current ? '#FFFFFF' : colorRef.current,
              width: eraserRef.current ? 30 : 6 
            };
            setPaths((prev) => [...prev, nuevoTrazo]);
          }
          return ''; 
        });
      },
    })
  ).current;

  const colors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#000000'];

  const activarModoLapiz = (color = colorRef.current) => {
    setSelectedColor(color);
    colorRef.current = color;
    setIsEraser(false);
    eraserRef.current = false;
  };

  const activarGoma = () => {
    setIsEraser(true);
    eraserRef.current = true;
  };

  return (
    <View style={[styles.container, { flex: 1 }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER CORREGIDO*/}
      <View style={[styles.topBar, { paddingTop: insets.top ,flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center'
      }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={[styles.brandName, { marginLeft: 10 }]}>Taller de Arte</Text>
        </View>
        
        <TouchableOpacity onPress={() => setPaths([])} style={styles.canvasDeleteButton}>
          <MaterialCommunityIcons name="delete-sweep" size={26} color="#F43F5E" />
        </TouchableOpacity>
      </View>

      {/* ÁREA DEL LIENZO */}
      <View style={styles.canvasWrapper}>
        <View style={styles.canvasContainer} {...panResponder.panHandlers}>
          <Svg height="100%" width="100%">
            {paths.map((item, index) => (
              <Path key={index} d={item.d} stroke={item.color} strokeWidth={item.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {currentPath ? (
              <Path d={currentPath} stroke={isEraser ? '#F1F5F9' : selectedColor} strokeWidth={isEraser ? 30 : 6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : null}
          </Svg>
        </View>
      </View>

      {/* BARRA DE HERRAMIENTAS */}
      <View style={[styles.settingsCard, styles.canvasFooter, { paddingBottom: insets.bottom + 15 }]}>
        <View style={styles.canvasTools}>
          
          {/* Botón Lápiz */}
          <TouchableOpacity onPress={() => activarModoLapiz()}style={[styles.canvasTool, !isEraser && { backgroundColor: '#334155' }]}>
            <MaterialCommunityIcons name="pencil" size={28} color={!isEraser ? "white" : "#64748B"} />
          </TouchableOpacity>

          {/* Botón Goma */}
          <TouchableOpacity  onPress={activarGoma}style={[styles.canvasTool, isEraser && { backgroundColor: '#334155' }, { marginRight: 15 }]}>
            <MaterialCommunityIcons  name="eraser" size={28} color={isEraser ? "white" : "#64748B"} />
          </TouchableOpacity>

          {/* Colores */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {colors.map((c) => {
              const isActive = selectedColor === c && !isEraser;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => activarModoLapiz(c)}
                  style={[
                    styles.canvasColorCircle, 
                    { backgroundColor: c },
                    isActive && styles.canvasActiveColorCircle
                  ]}
                />
              );
            })}
          </ScrollView>
        </View>

        <Text style={[styles.canvasStatusText, isEraser && { color: '#334155' }]}>
          {isEraser ? "MODO GOMA" : "MODO LÁPIZ"}
        </Text>
      </View>
    </View>
  );
}