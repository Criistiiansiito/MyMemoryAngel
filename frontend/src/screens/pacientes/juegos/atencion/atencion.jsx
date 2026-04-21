import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Platform, StatusBar, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from '../../../../style/styles';
import { useAccesibilidad } from '../../../../services/accesibilidadContext';

const simbolos = ['★', '▲', '●', '■', '♥'];

export default function Atencion({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [objetivo, setObjetivo] = useState('');
  const [lista, setLista] = useState([]);
  const [ronda, setRonda] = useState(1);
  const [aciertos, setAciertos] = useState(0);
  const [mensaje, setMensaje] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const nuevaRonda = useCallback(() => {
    const nuevoObjetivo = simbolos[Math.floor(Math.random() * simbolos.length)];
    const nuevaLista = Array.from({ length: 12 }, () =>
      simbolos[Math.floor(Math.random() * simbolos.length)]
    );

    if (!nuevaLista.includes(nuevoObjetivo)) {
      nuevaLista[Math.floor(Math.random() * nuevaLista.length)] = nuevoObjetivo;
    }

    setObjetivo(nuevoObjetivo);
    setLista(nuevaLista);
    setMensaje('');
    fadeAnim.setValue(0);
  }, [fadeAnim]);

  useEffect(() => {
    nuevaRonda();
  }, [nuevaRonda]);

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (simbolo, index) => {
    if (simbolo === objetivo) {
      setAciertos((prev) => prev + 1);
      const nuevaLista = [...lista];
      nuevaLista[index] = '';
      setLista(nuevaLista);

      const quedan = nuevaLista.filter((s) => s === objetivo).length;
      if (quedan === 0) {
        if (ronda < 5) {
          setRonda(ronda + 1);
          mostrarMensaje('✅ ¡Ronda superada!');
          setTimeout(() => nuevaRonda(), 800);
        } else {
          setMensaje('🎉 ¡Fin del juego!');
          setRonda(6);
        }
      } else {
        mostrarMensaje('✅ ¡Encontrado!');
      }
    } else {
      mostrarMensaje('❌ Ese no es');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[
        styles.topBar,
        { paddingTop: insets.top }
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Atención Visual</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <View style={[styles.settingsCard, { width: '100%', alignItems: 'center', paddingVertical: 20 }]}>
          <Text style={{ fontSize: aplicarEscala(16), color: '#64748B', marginBottom: 10 }}>
            {ronda <= 5 ? `Ronda ${ronda} de 5` : 'Juego Completado'}
          </Text>

          {ronda <= 5 ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: aplicarEscala(20), fontWeight: '700', color: '#1E293B', marginBottom: 10 }}>
                Busca todos los:
              </Text>
              <View style={[localStyles.objetivoCircle]}>
                <Text style={{ fontSize: 40, color: '#10B981' }}>{objetivo}</Text>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name="trophy" size={60} color="#F59E0B" />
              <Text style={{ fontSize: aplicarEscala(22), fontWeight: 'bold', color: '#1E293B', marginTop: 10 }}>
                ¡Excelente atención!
              </Text>
              <Text style={{ color: '#64748B' }}>Aciertos totales: {aciertos}</Text>
            </View>
          )}
        </View>

        {ronda <= 5 && (
          <View style={localStyles.grid}>
            {lista.map((s, i) => (
              <TouchableOpacity
                key={i}
                disabled={!s}
                style={[
                  localStyles.cell,
                  !s && { backgroundColor: 'transparent', borderColor: 'transparent' }
                ]}
                onPress={() => s && handlePress(s, i)}
              >
                <Text style={{ fontSize: 32, color: '#334155' }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {mensaje ? (
          <Animated.View style={{ opacity: fadeAnim, marginTop: 20 }}>
            <Text style={{ fontSize: aplicarEscala(18), fontWeight: '600', color: mensaje.includes('❌') ? '#EF4444' : '#10B981' }}>
              {mensaje}
            </Text>
          </Animated.View>
        ) : null}

        <TouchableOpacity
          style={[styles.mainButton, { marginTop: 30, width: '100%', backgroundColor: ronda > 5 ? '#10B981' : '#64748B' }]}
          onPress={onBack}
        >
          <Text style={styles.mainButtonText}>{ronda > 5 ? 'Finalizar' : 'Salir del juego'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  objetivoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginTop: 25,
  },
  cell: {
    width: 75,
    height: 75,
    backgroundColor: 'white',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
