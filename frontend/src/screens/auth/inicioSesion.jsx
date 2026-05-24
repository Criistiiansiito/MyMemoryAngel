import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { getStyles } from '../../style/styles'; 
import { useAccesibilidad } from '../../services/accesibilidadContext';
import { registrarDispositivoParaNotificaciones } from '../../services/notificacionesService';

const API = `${process.env.EXPO_PUBLIC_IP}`;

const setToken = async (key, value) => {
  if (Platform.OS === 'web') localStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
};

export default function InicioSesion({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('error');
  
  const [borderStatus, setBorderStatus] = useState(null);

  const { aplicarEscala } = useAccesibilidad();
  const styles = getStyles(aplicarEscala);

  const colors = {
    errorBg: '#FFF5F5',
    errorBorder: '#FEB2B2',
    successBg: '#F0FFF4',
    successBorder: '#9AE6B4',
    defaultBorder: '#E2E8F0',
    defaultBg: '#F7FAFC'
  };

  const getDynamicStyles = () => {
    if (borderStatus === 'error') {
      return { borderColor: colors.errorBorder, backgroundColor: colors.errorBg };
    }
    if (borderStatus === 'success') {
      return { borderColor: colors.successBorder, backgroundColor: colors.successBg };
    }
    return { borderColor: colors.defaultBorder, backgroundColor: colors.defaultBg };
  };

  const handleLogin = async () => {
    setMessage(null);
    setBorderStatus(null);

    if (!email || !password) {
      setMessage('Rellena email y contraseña');
      setMessageType('error');
      setBorderStatus('error');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      
      try {
        await registrarDispositivoParaNotificaciones(idToken);
      } catch (pushError) {
        console.log('No se pudo registrar push token:', pushError.message);
      }      
      
      await setToken('userToken', idToken);

      const res = await axios.get(`${API}/perfil/profile`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      const perfil = res.data.usuario;
      await AsyncStorage.setItem('user', JSON.stringify(perfil));

      setLoading(false);
      setMessage('¡Inicio de sesión exitoso!');
      setMessageType('success');
      setBorderStatus('success');

      setTimeout(() => {
        if (perfil.tipo_usuario === 'paciente') {
          navigation.replace('DashboardPaciente');
        } else {
          navigation.replace('DashboardCuidador');
        }
      }, 800);

    } catch (err) {
      setLoading(false);
      setBorderStatus('error');
      setMessageType('error');
      
      const errorCode = err.code;
      
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
        setMessage('¡Credenciales incorrectas! Revisa tu email y contraseña.');
      } else if (errorCode === 'auth/wrong-password') {
        setMessage('La contraseña es incorrecta.');
      } else if (errorCode === 'auth/invalid-email') {
        setMessage('El formato del correo no es válido.');
      } else if (errorCode === 'auth/too-many-requests') {
        setMessage('Demasiados intentos. Inténtalo más tarde.');
      } else {
        setMessage("Error al conectar con el servidor.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentPadding} showsVerticalScrollIndicator={false}contentContainerStyle={{ paddingBottom: 60 }} >
        <View style={{ marginBottom: 30, marginTop: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#1A202C' }}>¡Hola de nuevo!</Text>
          <Text style={{ fontSize: 15, color: '#718096', marginTop: 5 }}>Te echábamos de menos en MyMemoryAngel</Text>
        </View>

        {message && (
          <Text style={[styles.message, { 
              color: messageType === 'error' ? '#E53E3E' : '#38A169', 
              marginBottom: 20,
              textAlign: 'center',
              fontWeight: '600'
            }
          ]}>
            {message}
          </Text>
        )}

        <Text style={styles.label}>Correo electrónico</Text>
        <View style={[styles.inputContainer, getDynamicStyles(), { borderWidth: 1.5, borderRadius: 12 } ]}>
            <MaterialCommunityIcons name="email-outline" style={styles.inputIcon} />
          <TextInput placeholder="tu@gmail.com" value={email} onChangeText={(val) => { setEmail(val); setBorderStatus(null); }} style={[styles.input, { backgroundColor: 'transparent' }]}autoCapitalize="none"keyboardType="email-address" placeholderTextColor="#A0AEC0"/>
        </View>

        <Text style={styles.label}>Contraseña</Text>
        <View style={[styles.inputContainer, getDynamicStyles(),{ borderWidth: 1.5, borderRadius: 12 }]}>          
          <MaterialCommunityIcons name="lock-outline" style={styles.inputIcon} />
          <TextInput placeholder="........" value={password} onChangeText={(val) => { setPassword(val); setBorderStatus(null); }} style={[styles.input, { backgroundColor: 'transparent' }]} secureTextEntry={!showPassword}placeholderTextColor="#A0AEC0"/>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#A0AEC0" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.loginLink, { marginTop: 10 }]} onPress={() => navigation.navigate('Bienvenida')}>
          <Text style={styles.loginText}>¿No tienes cuenta? <Text style={{fontWeight: 'bold'}}>Regístrate</Text></Text>
        </TouchableOpacity>

         <TouchableOpacity 
          style={[styles.mainButton, { marginTop: 40, height: 60, justifyContent: 'center',backgroundColor: styles.mainButton.backgroundColor || '#1A202C'}]} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.mainButtonText, { fontSize: 18 }]}>Entrar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
