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
import { registerForPushNotificationsAsync, enviarPushTokenAlBackend } from '../../services/notificacionesService';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

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

  const { aplicarEscala } = useAccesibilidad();
  const styles = getStyles(aplicarEscala);

  const handleLogin = async () => {
    setMessage(null);
    if (!email || !password) {
      setMessage('Rellena email y contraseña');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      
      // Registrar push token del dispositivo
        try {
          const expoPushToken = await registerForPushNotificationsAsync();
          await enviarPushTokenAlBackend({
            token: expoPushToken,
            firebaseToken: idToken,
            platform: Platform.OS,
          });
        } catch (pushError) {
          console.log('No se pudo registrar push token:', pushError.message);
        }      
      
      // Guardar token de sesión de forma segura
      await setToken('userToken', idToken);

      // Obtener perfil desde la base de datos MySQL
      const res = await axios.get(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      const perfil = res.data.usuario;

      // Guardar objeto completo del usuario para persistencia
      await AsyncStorage.setItem('user', JSON.stringify(perfil));

      setLoading(false);
      setMessage('Inicio de sesión exitoso');
      setMessageType('success');

      // Navegación basada en el rol del usuario
      setTimeout(() => {
        if (perfil.tipo_usuario === 'paciente') {
          navigation.replace('DashboardPaciente');
        } else {
          navigation.replace('DashboardCuidador');
        }
      }, 800);

    } catch (err) {
      setLoading(false);
      setMessage(err.response?.data?.error || "Error al iniciar sesión");
      setMessageType('error');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.contentPadding} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ marginBottom: 30, marginTop: 10 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#1A202C' }}>¡Hola de nuevo!</Text>
          <Text style={{ fontSize: 15, color: '#718096', marginTop: 5 }}>Te echábamos de menos en MyMemoryAngel</Text>
        </View>

        {message && (
          <Text style={[styles.message, { color: messageType === 'error' ? '#E53E3E' : '#38A169', marginBottom: 20 }]}>
            {message}
          </Text>
        )}

        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" style={styles.inputIcon} />
          <TextInput 
            placeholder="tu@email.com" 
            value={email} 
            onChangeText={setEmail} 
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" style={styles.inputIcon} />
          <TextInput 
            placeholder="........" 
            value={password} 
            onChangeText={setPassword} 
            style={styles.input}
            secureTextEntry={!showPassword}
            placeholderTextColor="#A0AEC0"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#A0AEC0" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginLink} 
          onPress={() => navigation.navigate('Bienvenida')}
        >
          <Text style={styles.loginText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.mainButton} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.mainButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}