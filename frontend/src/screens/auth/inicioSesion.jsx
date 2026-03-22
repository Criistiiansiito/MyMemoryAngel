import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { styles } from '../../style/styles'; 

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : 'http://192.168.1.99:5000/api';

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
      await setToken('userToken', idToken);

      const res = await axios.get(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      const perfil = res.data.usuario;
      setLoading(false);
      setMessage('Inicio de sesión exitoso');
      setMessageType('success');

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
      
      <ScrollView style={styles.contentPadding} showsVerticalScrollIndicator={false}>
        {/* TITULO DE BIENVENIDA */}
        <View style={{ marginBottom: 30, marginTop: 10 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#1A202C' }}>¡Hola de nuevo!</Text>
          <Text style={{ fontSize: 15, color: '#718096', marginTop: 5 }}>Te echábamos de menos en MyMemoryAngel</Text>
        </View>

        {message && (
          <Text style={[styles.message, { color: messageType === 'error' ? '#E53E3E' : '#38A169', marginBottom: 20 }]}>
            {message}
          </Text>
        )}

        {/* INPUT EMAIL */}
        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" size={22} color="#A0AEC0" style={styles.inputIcon} />
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

        {/* INPUT CONTRASEÑA */}
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" size={22} color="#A0AEC0" style={styles.inputIcon} />
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

        {/* ENLACE REGISTRO */}
        <TouchableOpacity 
          style={styles.loginLink} 
          onPress={() => navigation.navigate('Bienvenida')}
        >
          <Text style={styles.loginText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FOOTER CON BOTÓN ENTRAR */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.mainButton} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainButtonText}>Entrar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}