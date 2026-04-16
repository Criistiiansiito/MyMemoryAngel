import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  Platform, StatusBar, KeyboardAvoidingView, ScrollView 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

export default function Calculadora({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [respuesta, setRespuesta] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [esCorrecto, setEsCorrecto] = useState(false);

  const nuevaPregunta = () => {
    setNum1(Math.floor(Math.random() * 20) + 1);
    setNum2(Math.floor(Math.random() * 20) + 1);
    setRespuesta('');
  };

  useEffect(() => {
    nuevaPregunta();
  }, []);

  const comprobar = () => {
    const valorUser = parseInt(respuesta);
    const resultadoReal = num1 + num2;

    if (valorUser === resultadoReal) {
      setEsCorrecto(true);
      setMensaje('¡Excelente trabajo! ✅');
    } else {
      setEsCorrecto(false);
      setMensaje(`Casi, el resultado era ${resultadoReal} ❌`);
    }

    // Esperar un momento para mostrar el mensaje y luego cambiar de pregunta
    setTimeout(() => {
      setMensaje(null);
      nuevaPregunta();
    }, 2000);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      {/* CABECERA DINÁMICA */}
      <View style={[
        styles.topBar, 
        { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Cálculo Mental</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        
        {/* TARJETA DEL JUEGO */}
        <View style={[styles.settingsCard, { width: '100%', alignItems: 'center', paddingVertical: 40 }]}>
          <MaterialCommunityIcons name="calculator-variant" size={50} color="#3B82F6" style={{ marginBottom: 20 }} />
          
          <Text style={{ fontSize: aplicarEscala(18), color: '#64748B', marginBottom: 10 }}>
            Resuelve la operación:
          </Text>
          
          <Text style={{ fontSize: aplicarEscala(48), fontWeight: '800', color: '#1E293B', marginBottom: 30 }}>
            {num1} + {num2}
          </Text>

          <TextInput 
            style={{
              backgroundColor: '#F1F5F9',
              borderRadius: 15,
              width: '80%',
              height: 80,
              fontSize: aplicarEscala(32),
              textAlign: 'center',
              color: '#334155',
              borderWidth: 2,
              borderColor: '#E2E8F0'
            }}
            keyboardType="numeric" 
            value={respuesta} 
            onChangeText={setRespuesta}
            placeholder="?"
            placeholderTextColor="#94A3B8"
            autoFocus
          />
        </View>

        {/* MENSAJE DE FEEDBACK */}
        {mensaje && (
          <View style={{ 
            marginTop: 20, 
            padding: 15, 
            borderRadius: 12, 
            backgroundColor: esCorrecto ? '#DCFCE7' : '#FEE2E2',
            width: '100%' 
          }}>
            <Text style={{ 
              textAlign: 'center', 
              fontSize: aplicarEscala(18), 
              fontWeight: '600', 
              color: esCorrecto ? '#166534' : '#991B1B' 
            }}>
              {mensaje}
            </Text>
          </View>
        )}

        {/* BOTÓN DE RESPUESTA */}
        <TouchableOpacity 
          style={[
            styles.mainButton, 
            { marginTop: 30, width: '100%', opacity: respuesta ? 1 : 0.6 }
          ]} 
          onPress={comprobar}
          disabled={!respuesta || mensaje !== null}
        >
          <Text style={styles.mainButtonText}>Comprobar resultado</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}