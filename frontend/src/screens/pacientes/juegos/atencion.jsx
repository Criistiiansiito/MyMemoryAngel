import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

export default function Memoria({ onBack }) {
  const { aplicarEscala } = useAccesibilidad();
  const styles = getStyles(aplicarEscala);
  
  const simbolos = ['★', '▲', '●', '■', '♥'];
  const [objetivo, setObjetivo] = useState('');
  const [lista, setLista] = useState([]);
  const [ronda, setRonda] = useState(1);
  const [aciertos, setAciertos] = useState(0);
  const [mensaje, setMensaje] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current; // control de opacidad

  // Genera una nueva ronda
  const nuevaRonda = () => {
    const nuevoObjetivo = simbolos[Math.floor(Math.random() * simbolos.length)];
    const nuevaLista = Array.from({ length: 20 }, () =>
      simbolos[Math.floor(Math.random() * simbolos.length)]
    );
    setObjetivo(nuevoObjetivo);
    setLista(nuevaLista);
    setMensaje('');
    fadeAnim.setValue(0); // resetea animación
  };

  useEffect(() => {
    nuevaRonda();
  }, []);

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => setMensaje('')); // se borra al terminar
  };

  const handlePress = (simbolo, index) => {
    if (simbolo === objetivo) {
      setAciertos((prev) => prev + 1);
      const nuevaLista = [...lista];
      nuevaLista[index] = ''; // eliminar el símbolo acertado
      setLista(nuevaLista);

      // Si ya no quedan más objetivos visibles, pasa de ronda
      const quedan = nuevaLista.filter((s) => s === objetivo).length;
      if (quedan === 0) {
        if (ronda < 5) {
          setRonda(ronda + 1);
          mostrarMensaje('✅ ¡Bien hecho!');
          setTimeout(() => nuevaRonda(), 800);
        } else {
          setMensaje(`🎉 Fin del juego. Aciertos totales: ${aciertos + 1}`);
        }
      } else {
        mostrarMensaje('✅ Correcto');
      }
    } else {
      mostrarMensaje('❌ No es el símbolo correcto');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ronda {ronda} / 5</Text>
      <Text style={styles.subtitle}>Encuentra todos los símbolos {objetivo}</Text>

      <View style={styles.grid}>
        {lista.map((s, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.cell, !s && styles.cellEmpty]}
            onPress={() => s && handlePress(s, i)}
          >
            <Text style={styles.symbol}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mensaje ? (
        <Animated.Text style={[styles.msg, { opacity: fadeAnim }]}>
          {mensaje}
        </Animated.Text>
      ) : null}

      {ronda > 5 ? (
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.back} onPress={onBack}>
          <Text style={styles.backText}>Salir</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 360,
    justifyContent: 'center',
    marginBottom: 20,
  },
  cell: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: '#007bff33',
    borderRadius: 8,
  },
  cellEmpty: { backgroundColor: 'transparent' },
  symbol: { fontSize: 24 },
  msg: { fontSize: 18, marginTop: 10, textAlign: 'center' },
  back: { marginTop: 10 },
  backText: { color: '#007bff', fontSize: 16 },
  button: { backgroundColor: '#007bff', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
